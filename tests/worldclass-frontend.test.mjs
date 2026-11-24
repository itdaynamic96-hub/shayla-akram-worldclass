import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const root=new URL("../site-overrides/",import.meta.url);
const read=path=>readFile(new URL(path,root),"utf8");
const [config,admin,forms,setup,setupHtml,apply,volunteer,site,module,video]=await Promise.all([
 read("assets/app-config.js"),read("assets/admin.js"),read("assets/forms.js"),read("assets/setup.js"),read("setup.html"),
 read("apply.html"),read("volunteer.html"),read("assets/site.js"),read("assets/module.js"),read("assets/video-gallery.js")
]);
test("public frontend configuration points to the isolated Worker and only exposes Turnstile site key",()=>{
 assert.ok(config.includes("shayla-worldclass-api.itdaynamic96.workers.dev"));
 assert.ok(config.includes("turnstileSiteKey"));
 assert.ok(!/TURNSTILE_SECRET|SETUP_TOKEN|CLOUDFLARE_API_TOKEN/i.test(config));
});
test("public site and module pages read content from the API with static fallback",()=>{
 assert.ok(site.includes("/api/public/bootstrap"));
 assert.ok(module.includes("/api/public/bootstrap"));
 assert.ok(site.includes("content.json"));
 assert.ok(module.includes("content.json"));
});
test("video gallery reads API video records and retains safe YouTube embeds",()=>{
 assert.ok(video.includes("/api/public/bootstrap"));
 assert.ok(video.includes("youtubeId"));
 assert.ok(video.includes("embedUrl(video.id)"));
});
test("admin dashboard uses bearer sessions and private API routes",()=>{
 assert.ok(admin.includes("sessionStorage"));
 assert.ok(admin.includes("Authorization"));
 assert.ok(admin.includes('"/api/admin/"+s.dataset.statusKind+"/status"'));
 for(const route of ["/api/admin/login","/api/admin/data","/api/admin/content","/api/admin/video","/api/admin/prayer"])assert.ok(admin.includes(route),"missing "+route);
 assert.ok(!admin.includes("/api/admin/finance"));
 assert.ok(admin.includes("WORD_LIMIT=500"));
 assert.ok(admin.includes("writingFieldsValid"));
});
test("personal-data forms require Turnstile and send only to private intake endpoint",()=>{
 for(const page of [apply,volunteer]){
  assert.ok(page.includes("challenges.cloudflare.com/turnstile"));
  assert.ok(page.includes("turnstile"));
 }
 assert.ok(forms.includes("/api/intake"));
 assert.ok(forms.includes("turnstileToken"));
 assert.ok(forms.includes("website"));
 assert.ok(forms.includes("MAX_WORDS=500"));
 assert.ok(forms.includes("প্রতিটি লেখার ঘরে সর্বোচ্চ ৫০০ শব্দ"));
});
test("first-admin setup requires a one-time token and strong password",()=>{
 assert.ok(setup.includes("X-Setup-Token"));
 assert.ok(setup.includes("/api/admin/setup"));
 assert.ok(setupHtml.includes("minlength=\"14\""));
});
