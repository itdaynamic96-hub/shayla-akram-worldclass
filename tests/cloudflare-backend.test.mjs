import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const schema = await readFile(new URL("../cloudflare/migrations/0001_init.sql", import.meta.url), "utf8");
const worker = await readFile(new URL("../cloudflare/src/index.js", import.meta.url), "utf8");
const config = await readFile(new URL("../cloudflare/wrangler.toml", import.meta.url), "utf8");

test("D1 schema contains all required separate data domains", () => {
  for (const table of ["admin_users","admin_sessions","site_content","videos","prayer_times","applications","volunteers","account_entries","audit_log"]) {
    assert.match(schema, new RegExp("CREATE TABLE IF NOT EXISTS " + table + "\\b"));
  }
});

test("private personal and finance tables are not part of public bootstrap query", () => {
  const publicBlock = worker.split('if(path==="/api/public/bootstrap"')[1].split('if(path==="/api/intake"')[0];
  assert.doesNotMatch(publicBlock, /applications|volunteers|account_entries|admin_users/);
  assert.match(worker, /const admin=await adminFromRequest\\(request,env\\)/);
});

test("public intake requires Turnstile verification and honeypot validation", () => {
  assert.match(worker, /verifyTurnstile\\(clean\\(body\\.turnstileToken/);
  assert.match(worker, /if\\(clean\\(body\\.website,200\\)\\)/);
  assert.match(worker, /if\\(!env\\.TURNSTILE_SECRET \\|\\| !token\\) return false/);
});

test("Worker binds only the isolated World-Class D1 database", () => {
  assert.match(config, /binding = "DB"/);
  assert.match(config, /database_name = "shayla-worldclass-db"/);
  assert.match(config, /4751623a-fcbd-4b68-b5a8-71f20c1fd2a7/);
  assert.doesNotMatch(config, /r2_buckets|appwrite|supabase/i);
});

test("admin sessions expire and login attempts are throttled", () => {
  assert.match(worker, /SESSION_SECONDS = 8 \\* 60 \\* 60/);
  assert.match(worker, /total\\?\\.total\\|\\|0/);
  assert.match(worker, /expires_at>\\?/);
});

test("private application and finance reads are not in the public bootstrap route", () => {
  const publicBlock = worker.split('if(path==="/api/public/bootstrap"')[1].split('if(path==="/api/intake"')[0];
  assert.doesNotMatch(publicBlock, /SELECT \\* FROM applications|SELECT \\* FROM volunteers|SELECT \\* FROM account_entries/);
});
