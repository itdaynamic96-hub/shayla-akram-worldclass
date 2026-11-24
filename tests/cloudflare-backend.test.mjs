import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const schema = await readFile(new URL("../cloudflare/migrations/0001_init.sql", import.meta.url), "utf8");
const worker = await readFile(new URL("../cloudflare/src/index.js", import.meta.url), "utf8");
const config = await readFile(new URL("../cloudflare/wrangler.toml", import.meta.url), "utf8");

test("D1 schema contains all required separate data domains", () => {
  for (const table of ["admin_users","admin_sessions","login_attempts","site_content","videos","prayer_times","applications","volunteers","account_entries","audit_log"]) {
    assert.ok(schema.includes("CREATE TABLE IF NOT EXISTS " + table), "missing table " + table);
  }
});

test("private personal and finance tables are not part of public bootstrap query", () => {
  const publicBlock = worker.split('if(path==="/api/public/bootstrap"')[1].split('if(path==="/api/intake"')[0];
  assert.ok(publicBlock);
  for (const table of ["applications","volunteers","account_entries","admin_users"]) assert.ok(!publicBlock.includes(table));
  assert.ok(worker.includes("const admin=await adminFromRequest(request,env)"));
});

test("public intake requires Turnstile verification and honeypot validation", () => {
  assert.ok(worker.includes("verifyTurnstile(clean(body.turnstileToken"));
  assert.ok(worker.includes("if(clean(body.website,200))"));
  assert.ok(worker.includes("if(!env.TURNSTILE_SECRET || !token) return false"));
});

test("Worker binds only the isolated World-Class D1 database", () => {
  assert.ok(config.includes('binding = "DB"'));
  assert.ok(config.includes('database_name = "shayla-worldclass-db"'));
  assert.ok(config.includes("4751623a-fcbd-4b68-b5a8-71f20c1fd2a7"));
  assert.ok(!/r2_buckets|appwrite|supabase/i.test(config));
});

test("admin sessions expire and login attempts are throttled", () => {
  assert.ok(worker.includes("SESSION_SECONDS = 8 * 60 * 60"));
  assert.ok(worker.includes("Number(row?.total||0)>=5"));
  assert.ok(worker.includes("expires_at>?"));
});

test("D1 migration is idempotent and does not delete data", () => {
  assert.ok(worker.includes('path==="/api/setup/migrate" && request.method==="GET"'));
  assert.ok(worker.includes("await env.DB.exec(SCHEMA_SQL)"));
  assert.ok(!/DROP TABLE|DELETE FROM site_content|DELETE FROM applications/i.test(schema));
});

test("setup status reports only whether an admin account exists", () => {
  assert.ok(worker.includes('SELECT COUNT(*) AS total FROM admin_users'));
  assert.ok(worker.includes('adminAccountCreated:Number(adminCount?.total||0)>0'));
  assert.ok(!worker.includes('adminPassword') && !worker.includes('password_hash FROM admin_users'));
});


test("admin setup readiness diagnostics reveal only safe booleans", () => {
  assert.ok(worker.includes('PRAGMA table_info(admin_users)'));
  assert.ok(worker.includes('const adminSchemaValid=requiredAdminColumns.every'));
  assert.ok(worker.includes('setupTokenConfigured:Boolean(env.SETUP_TOKEN)'));
  assert.ok(!worker.includes('actualAdminColumns:'));
});


test("admin setup failures expose only a safe stage code, never secret values", () => {
  for (const stage of ["check_configuration","read_request","verify_setup_token","check_existing_admin","validate_credentials","generate_password_hash","save_admin_record"]) assert.ok(worker.includes('setupStage="'+stage+'"'));
  assert.ok(worker.includes('const errorCode="ADMIN_SETUP_"+(setupStage||"UNKNOWN").toUpperCase()'));
  assert.ok(worker.includes('errorCode},500,cors'));
  assert.ok(!worker.includes('errorCode: error.message'));
});
