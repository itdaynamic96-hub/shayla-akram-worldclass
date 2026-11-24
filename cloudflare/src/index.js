const encoder = new TextEncoder();
const VALID_MODULES = new Set([...Array.from({length:16},(_,i)=>i+1),...Array.from({length:9},(_,i)=>i+26)]);
const MAX_BODY = 16 * 1024;
const MAX_WORDS = 500;
const wordCount = value => (String(value ?? '').trim().match(/\S+/g) || []).length;
const SESSION_SECONDS = 8 * 60 * 60;
const SCHEMA_SQL = String.raw`-- Cloudflare D1 schema for the independent World-Class Hybrid backend.
-- Private tables are never exposed by public API routes.
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_hash TEXT NOT NULL,
  attempted_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip_hash, attempted_at);

CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  module_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0,1)),
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_site_content_public ON site_content(published, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_content_module ON site_content(module_id, published);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prayer_times (
  date_key TEXT PRIMARY KEY,
  fajr TEXT NOT NULL,
  sunrise TEXT NOT NULL DEFAULT '',
  dhuhr TEXT NOT NULL,
  asr TEXT NOT NULL,
  maghrib TEXT NOT NULL,
  isha TEXT NOT NULL,
  jumuah TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  submitted_at TEXT NOT NULL,
  reviewed_at TEXT,
  review_note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_applications_status_date ON applications(status, submitted_at DESC);

CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  skills TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  submitted_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_volunteers_status_date ON volunteers(status, submitted_at DESC);

CREATE TABLE IF NOT EXISTS account_entries (
  id TEXT PRIMARY KEY,
  fund TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income','expense')),
  amount_paisa INTEGER NOT NULL CHECK (amount_paisa > 0),
  occurred_on TEXT NOT NULL,
  description TEXT NOT NULL,
  reference TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_account_entries_fund_date ON account_entries(fund, occurred_on DESC);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
`;

const json = (data, status=200, headers={}) => new Response(JSON.stringify(data), {
  status, headers: {"content-type":"application/json; charset=utf-8", "cache-control":"no-store", ...headers}
});
const clean = (v, max=2000) => String(v ?? "").trim().slice(0,max);
const nowIso = () => new Date().toISOString();
const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = value => Uint8Array.from(atob(value), c=>c.charCodeAt(0));
const randomToken = (n=32) => {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
};
async function digest(value) {
  return b64(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:unb64(salt),iterations:120000,hash:"SHA-256"},key,256);
  return b64(bits);
}
function constantEqual(a,b) {
  if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length)return false;
  let out=0; for(let i=0;i<a.length;i++)out|=a.charCodeAt(i)^b.charCodeAt(i);
  return out===0;
}
async function readBody(request) {
  const length=Number(request.headers.get("content-length")||0);
  if(length>MAX_BODY)throw new Error("Request body too large");
  const raw=await request.text();
  if(raw.length>MAX_BODY)throw new Error("Request body too large");
  return JSON.parse(raw||"{}");
}
function corsHeaders(origin, env) {
  const allowed=env.ALLOWED_ORIGIN||"https://itdaynamic96-hub.github.io";
  if(origin && origin!==allowed && !origin.startsWith("http://localhost:")) return null;
  return {
    "access-control-allow-origin":origin||allowed,
    "access-control-allow-methods":"GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers":"Content-Type,Authorization,X-Setup-Token",
    "access-control-max-age":"86400",
    "vary":"Origin"
  };
}
async function verifyTurnstile(token, request, env) {
  if(!env.TURNSTILE_SECRET || !token) return false;
  const form=new FormData();
  form.set("secret",env.TURNSTILE_SECRET);
  form.set("response",token);
  const ip=request.headers.get("CF-Connecting-IP");
  if(ip)form.set("remoteip",ip);
  const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:form});
  if(!response.ok)return false;
  const result=await response.json();
  return result.success===true;
}
async function recordLoginAttempt(db, ipHash) {
  const now=Math.floor(Date.now()/1000);
  await db.prepare("DELETE FROM login_attempts WHERE attempted_at < ?").bind(now-900).run();
  const row=await db.prepare("SELECT COUNT(*) AS total FROM login_attempts WHERE ip_hash=? AND attempted_at>?").bind(ipHash,now-900).first();
  if(Number(row?.total||0)>=5)return false;
  await db.prepare("INSERT INTO login_attempts(ip_hash,attempted_at) VALUES(?,?)").bind(ipHash,now).run();
  return true;
}
async function adminFromRequest(request, env) {
  const header=request.headers.get("Authorization")||"";
  const token=header.startsWith("Bearer ")?header.slice(7):"";
  if(!token)return null;
  const hash=await digest(token);
  const row=await env.DB.prepare("SELECT s.admin_id, a.username FROM admin_sessions s JOIN admin_users a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires_at>?").bind(hash,Math.floor(Date.now()/1000)).first();
  return row||null;
}
async function audit(db, adminId, action, entity, entityId="") {
  await db.prepare("INSERT INTO audit_log(admin_id,action,entity,entity_id,created_at) VALUES(?,?,?,?,?)").bind(adminId,action,entity,entityId,nowIso()).run();
}
function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(String(value||"")) && !Number.isNaN(Date.parse(value+"T00:00:00Z")); }
function youtubeId(value) {
  try {
    const u=new URL(value);
    if(!["youtube.com","www.youtube.com","m.youtube.com","youtu.be","www.youtube-nocookie.com"].includes(u.hostname)||u.protocol!=="https:")return null;
    let id=u.hostname==="youtu.be"?u.pathname.slice(1):u.searchParams.get("v");
    if(!id && /\/(embed|shorts|live)\//.test(u.pathname))id=u.pathname.split("/").filter(Boolean).pop();
    return /^[A-Za-z0-9_-]{11}$/.test(id||"")?id:null;
  } catch { return null; }
}

export default {
  async fetch(request, env, ctx) {
    const origin=request.headers.get("Origin");
    const cors=corsHeaders(origin,env);
    if(!cors)return json({error:"Origin not allowed"},403);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
    const url=new URL(request.url);
    const path=url.pathname.replace(/\/+$/,"")||"/";
    let setupStage="";
    try {
      if(path==="/api/setup/migrate" && request.method==="GET") {
        const existing=await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admin_users'").first();
        if(!existing)await env.DB.exec(SCHEMA_SQL);
        const [tables,adminCount,adminColumns]=await Promise.all([
          env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all(),
          env.DB.prepare("SELECT COUNT(*) AS total FROM admin_users").first(),
          env.DB.prepare("PRAGMA table_info(admin_users)").all()
        ]);
        const requiredAdminColumns=["id","username","password_hash","password_salt","created_at"];
        const actualAdminColumns=(adminColumns.results||[]).map(row=>row.name);
        const adminSchemaValid=requiredAdminColumns.every(name=>actualAdminColumns.includes(name));
        return json({ok:true,initialized:true,adminAccountCreated:Number(adminCount?.total||0)>0,adminSchemaValid,setupTokenConfigured:Boolean(env.SETUP_TOKEN),tables:(tables.results||[]).map(row=>row.name)},200,cors);
      }
      if(path==="/api/setup/migrate" && request.method==="POST") {
        const supplied=request.headers.get("X-Setup-Token")||"";
        if(!env.SETUP_TOKEN || !constantEqual(supplied,env.SETUP_TOKEN))return json({error:"Setup token invalid"},403,cors);
        await env.DB.exec(SCHEMA_SQL);
        const tables=await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
        return json({ok:true,tables:(tables.results||[]).map(row=>row.name)},200,cors);
      }
      if(path==="/api/health" && request.method==="GET") {
        const row=await env.DB.prepare("SELECT 1 AS ok").first();
        return json({ok:row?.ok===1,service:"worldclass-api"},200,cors);
      }
      if(path==="/api/public/bootstrap" && request.method==="GET") {
        const cache= caches.default;
        const cacheKey=new Request(new URL("/api/public/bootstrap",request.url).toString(),{method:"GET"});
        const cached=await cache.match(cacheKey);
        if(cached)return new Response(cached.body,{status:cached.status,headers:{...Object.fromEntries(cached.headers),...cors}});
        const [content,videos,prayerTimes]=await Promise.all([
          env.DB.prepare("SELECT id,module_id AS moduleId,title,summary,body,published,updated_at AS updatedAt FROM site_content WHERE published=1 ORDER BY updated_at DESC LIMIT 250").all(),
          env.DB.prepare("SELECT id,youtube_id AS youtubeId,title,description,('https://www.youtube.com/watch?v=' || youtube_id) AS url FROM videos ORDER BY created_at DESC LIMIT 100").all(),
          env.DB.prepare("SELECT date_key AS dateKey,fajr,sunrise,dhuhr,asr,maghrib,isha,jumuah,updated_at AS updatedAt FROM prayer_times ORDER BY date_key DESC LIMIT 30").all()
        ]);
        const response=json({content:content.results||[],videos:videos.results||[],prayerTimes:prayerTimes.results||[]},200,{...cors,"cache-control":"public, max-age=60, s-maxage=60"});
        ctx.waitUntil(cache.put(cacheKey,response.clone()));
        return response;
      }
      if(path==="/api/intake" && request.method==="POST") {
        const body=await readBody(request);
        if(clean(body.website,200))return json({error:"Invalid submission"},400,cors);
        if(!await verifyTurnstile(clean(body.turnstileToken,4000),request,env))return json({error:"নিরাপত্তা যাচাই সম্পন্ন করুন।"},403,cors);
        const kind=clean(body.kind,20), data=body.data||{};
        const name=clean(data.name,120), phone=clean(data.phone,25), address=clean(data.address,1200);
        if(!name||!phone||!address)return json({error:"নাম, মোবাইল ও ঠিকানা পূরণ করুন।"},400,cors);
        if([name,address].some(value=>wordCount(value)>MAX_WORDS))return json({error:"প্রতিটি লেখার ঘরে সর্বোচ্চ ৫০০ শব্দ রাখা যাবে।"},400,cors);
        const id=crypto.randomUUID(), reference="SA-"+crypto.randomUUID().slice(0,8).toUpperCase(), submittedAt=nowIso();
        if(kind==="application") {
          const category=clean(data.category,80),details=clean(data.details,3000);
          if(!category||!details)return json({error:"আবেদনের প্রয়োজনীয় তথ্য পূরণ করুন।"},400,cors);
          if(wordCount(details)>MAX_WORDS)return json({error:"আবেদনের বিস্তারিত সর্বোচ্চ ৫০০ শব্দ হতে পারবে।"},400,cors);
          await env.DB.prepare("INSERT INTO applications(id,reference_code,category,name,phone,address,details,status,submitted_at) VALUES(?,?,?,?,?,?,?,?,?)").bind(id,reference,category,name,phone,address,details,"Pending",submittedAt).run();
        } else if(kind==="volunteer") {
          const skills=clean(data.skills,1500);
          if(!skills)return json({error:"দক্ষতার তথ্য লিখুন।"},400,cors);
          if(wordCount(skills)>MAX_WORDS)return json({error:"দক্ষতা ও আগ্রহের বিবরণ সর্বোচ্চ ৫০০ শব্দ হতে পারবে।"},400,cors);
          await env.DB.prepare("INSERT INTO volunteers(id,reference_code,name,phone,address,skills,status,submitted_at) VALUES(?,?,?,?,?,?,?,?)").bind(id,reference,name,phone,address,skills,"Pending",submittedAt).run();
        } else return json({error:"Unknown form type"},400,cors);
        return json({ok:true,referenceCode:reference},201,cors);
      }
      if(path==="/api/admin/setup" && request.method==="POST") {
        setupStage="check_configuration";
        if(!env.SETUP_TOKEN)return json({error:"Admin setup is not configured"},503,cors);
        setupStage="read_request";
        const body=await readBody(request);
        setupStage="verify_setup_token";
        const supplied=request.headers.get("X-Setup-Token")||"";
        if(!constantEqual(supplied,env.SETUP_TOKEN))return json({error:"Setup token invalid"},403,cors);
        setupStage="check_existing_admin";
        const count=await env.DB.prepare("SELECT COUNT(*) AS total FROM admin_users").first();
        if(Number(count?.total||0)>0)return json({error:"Admin account already initialized"},409,cors);
        setupStage="validate_credentials";
        const username=clean(body.username,80).toLowerCase(),password=String(body.password||"");
        if(!/^[a-z0-9._-]{3,80}$/.test(username)||password.length<14||password.length>128)return json({error:"Username or password does not meet requirements"},400,cors);
        setupStage="generate_password_salt";
        const salt=b64(crypto.getRandomValues(new Uint8Array(16)));
        setupStage="import_password_key";
        const passwordKey=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveBits"]);
        setupStage="derive_password_bits";
        const passwordBits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:unb64(salt),iterations:120000,hash:"SHA-256"},passwordKey,256);
        setupStage="encode_password_hash";
        const hash=b64(passwordBits);
        setupStage="save_admin_record";
        await env.DB.prepare("INSERT INTO admin_users(username,password_hash,password_salt) VALUES(?,?,?)").bind(username,hash,salt).run();
        return json({ok:true,message:"Admin account created. Remove SETUP_TOKEN from Worker secrets now."},201,cors);
      }
      if(path==="/api/admin/login" && request.method==="POST") {
        const body=await readBody(request),username=clean(body.username,80).toLowerCase(),password=String(body.password||"");
        const ip=request.headers.get("CF-Connecting-IP")||"unknown";
        const ipHash=await digest("worldclass-login:"+ip);
        if(!await recordLoginAttempt(env.DB,ipHash))return json({error:"অনেকবার চেষ্টা হয়েছে। ১৫ মিনিট পরে চেষ্টা করুন।"},429,cors);
        const user=await env.DB.prepare("SELECT id,username,password_hash,password_salt FROM admin_users WHERE username=?").bind(username).first();
        if(!user || !constantEqual(await passwordHash(password,user.password_salt||""),user.password_hash||""))return json({error:"লগইন তথ্য সঠিক নয়।"},401,cors);
        const token=randomToken(),tokenHash=await digest(token),expires=Math.floor(Date.now()/1000)+SESSION_SECONDS;
        await env.DB.prepare("INSERT INTO admin_sessions(token_hash,admin_id,expires_at) VALUES(?,?,?)").bind(tokenHash,user.id,expires).run();
        await env.DB.prepare("DELETE FROM login_attempts WHERE ip_hash=?").bind(ipHash).run();
        return json({ok:true,token,username:user.username,expiresAt:expires},200,cors);
      }
      if(path.startsWith("/api/admin/")) {
        const admin=await adminFromRequest(request,env);
        if(!admin)return json({error:"Unauthorized"},401,cors);
        if(path==="/api/admin/logout" && request.method==="POST") {
          const token=(request.headers.get("Authorization")||"").slice(7);
          await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash=?").bind(await digest(token)).run();
          return json({ok:true},200,cors);
        }
        if(path==="/api/admin/data" && request.method==="GET") {
          const [content,videos,prayerTimes,applications,volunteers]=await Promise.all([
            env.DB.prepare("SELECT * FROM site_content ORDER BY updated_at DESC LIMIT 500").all(),
            env.DB.prepare("SELECT * FROM videos ORDER BY created_at DESC LIMIT 200").all(),
            env.DB.prepare("SELECT * FROM prayer_times ORDER BY date_key DESC LIMIT 90").all(),
            env.DB.prepare("SELECT * FROM applications ORDER BY submitted_at DESC LIMIT 300").all(),
            env.DB.prepare("SELECT * FROM volunteers ORDER BY submitted_at DESC LIMIT 300").all(),
          ]);
          return json({username:admin.username,content:content.results||[],videos:videos.results||[],prayerTimes:prayerTimes.results||[],applications:applications.results||[],volunteers:volunteers.results||[],accountEntries:[]},200,cors);
        }
        if(path==="/api/admin/content" && request.method==="POST") {
          const b=await readBody(request),id=clean(b.id,80)||crypto.randomUUID(),moduleId=Number(b.moduleId),title=clean(b.title,180),body=clean(b.body,12000),summary=clean(b.summary||body.slice(0,240),500),published=b.published===true?1:0;
          if(!VALID_MODULES.has(moduleId)||!title||!body)return json({error:"মডিউল, শিরোনাম ও বিস্তারিত সঠিকভাবে দিন।"},400,cors);
          if([title,body,summary].some(value=>wordCount(value)>MAX_WORDS))return json({error:"প্রতিটি লেখার ঘরে সর্বোচ্চ ৫০০ শব্দ রাখা যাবে।"},400,cors);
          const updatedAt=nowIso();
          await env.DB.prepare("INSERT INTO site_content(id,module_id,title,summary,body,published,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET module_id=excluded.module_id,title=excluded.title,summary=excluded.summary,body=excluded.body,published=excluded.published,updated_at=excluded.updated_at").bind(id,moduleId,title,summary,body,published,updatedAt).run();
          await audit(env.DB,admin.admin_id,"save","content",id);
          return json({ok:true,id},200,cors);
        }
        if(path==="/api/admin/content" && request.method==="DELETE") {
          const id=clean(url.searchParams.get("id"),80);if(!id)return json({error:"ID required"},400,cors);
          await env.DB.prepare("DELETE FROM site_content WHERE id=?").bind(id).run();await audit(env.DB,admin.admin_id,"delete","content",id);return json({ok:true},200,cors);
        }
        if(path==="/api/admin/video" && request.method==="POST") {
          const b=await readBody(request),title=clean(b.title,160),description=clean(b.description,1000),youtube=youtubeId(clean(b.url,500));
          if(!title||!youtube)return json({error:"সঠিক শিরোনাম ও YouTube URL দিন।"},400,cors);
          if([title,description].some(value=>wordCount(value)>MAX_WORDS))return json({error:"ভিডিওর প্রতিটি লেখার ঘরে সর্বোচ্চ ৫০০ শব্দ রাখা যাবে।"},400,cors);
          const id=youtube;
          await env.DB.prepare("INSERT INTO videos(id,youtube_id,title,description,created_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,description=excluded.description").bind(id,youtube,title,description,nowIso()).run();
          await audit(env.DB,admin.admin_id,"save","video",id);return json({ok:true,id},200,cors);
        }
        if(path==="/api/admin/video" && request.method==="DELETE") {
          const id=clean(url.searchParams.get("id"),20);if(!/^[A-Za-z0-9_-]{11}$/.test(id))return json({error:"Invalid video ID"},400,cors);
          await env.DB.prepare("DELETE FROM videos WHERE id=?").bind(id).run();await audit(env.DB,admin.admin_id,"delete","video",id);return json({ok:true},200,cors);
        }
        if(path==="/api/admin/prayer" && request.method==="POST") {
          const b=await readBody(request),date=clean(b.dateKey,10),keys=["fajr","sunrise","dhuhr","asr","maghrib","isha","jumuah"];
          if(!validDate(date)||keys.some(k=>{const value=clean(b[k],5);return value!==""&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(value);})||["fajr","dhuhr","asr","maghrib","isha"].some(k=>!clean(b[k],5)))return json({error:"তারিখ ও নামাজের সময় সঠিকভাবে দিন।"},400,cors);
          await env.DB.prepare("INSERT INTO prayer_times(date_key,fajr,sunrise,dhuhr,asr,maghrib,isha,jumuah,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(date_key) DO UPDATE SET fajr=excluded.fajr,sunrise=excluded.sunrise,dhuhr=excluded.dhuhr,asr=excluded.asr,maghrib=excluded.maghrib,isha=excluded.isha,jumuah=excluded.jumuah,updated_at=excluded.updated_at").bind(date,...keys.map(k=>clean(b[k],5)),nowIso()).run();
          await audit(env.DB,admin.admin_id,"save","prayer_times",date);return json({ok:true},200,cors);
        }
        if((path==="/api/admin/application/status"||path==="/api/admin/volunteer/status")&&request.method==="POST") {
          const b=await readBody(request),id=clean(b.id,80),status=clean(b.status,30),note=clean(b.note,1000);
          if(!id||!["Pending","Reviewing","Approved","Rejected","Completed"].includes(status))return json({error:"Invalid status"},400,cors);
          const table=path.includes("application")?"applications":"volunteers";
          if(table==="applications")await env.DB.prepare("UPDATE applications SET status=?,reviewed_at=?,review_note=? WHERE id=?").bind(status,nowIso(),note,id).run();
          else await env.DB.prepare("UPDATE volunteers SET status=? WHERE id=?").bind(status,id).run();
          await audit(env.DB,admin.admin_id,"update-status",table,id);return json({ok:true},200,cors);
        }
        return json({error:"Not found"},404,cors);
      }
      return json({error:"Not found"},404,cors);
    } catch(error) {
      console.error("World-Class API error",error?.message||String(error));
      if(path==="/api/admin/setup" && request.method==="POST") {
        console.error("World-Class admin setup failed at",setupStage||"unknown_stage");
        const errorCode="ADMIN_SETUP_"+(setupStage||"UNKNOWN").toUpperCase();
        const safeErrorNames=new Set(["Error","TypeError","DataError","OperationError","NotSupportedError","InvalidAccessError","QuotaExceededError","AbortError","SyntaxError"]);
        const errorType=safeErrorNames.has(error?.name)?error.name.toUpperCase():"UNKNOWN";
        return json({error:"সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন। (ত্রুটি কোড: "+errorCode+"; ধরন: "+errorType+")",errorCode,errorType},500,cors);
      }
      return json({error:"সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।"},500,cors);
    }
  }
};
