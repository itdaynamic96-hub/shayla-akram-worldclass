import { normalizeVideos, extractYouTubeId } from "./youtube.mjs";
const $ = id => document.getElementById(id);
const KEY = "shayla-akram-youtube-videos-v1";
let videos = [];
let editing = null;
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function render() {
  $("videoCount").textContent = `${videos.length}টি ভিডিও`;
  $("videoRows").innerHTML = videos.length ? videos.map(v => `<article class="video-row"><div><strong>${escapeHtml(v.title)}</strong><p>${escapeHtml(v.url)}</p></div><div class="row"><button class="btn ghost" data-edit="${v.id}">সম্পাদনা</button><button class="btn ghost" data-delete="${v.id}">মুছুন</button></div></article>`).join("") : "<p>এখনো কোনো ভিডিও যোগ করা হয়নি।</p>";
  $("videoRows").querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => edit(b.dataset.edit)));
  $("videoRows").querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", () => { videos = videos.filter(v => v.id !== b.dataset.delete); persist(); render(); }));
}
function persist() { localStorage.setItem(KEY, JSON.stringify(videos)); }
function edit(id) { const v = videos.find(x => x.id === id); if (!v) return; editing=id; $("videoTitle").value=v.title; $("videoUrl").value=v.url; $("videoDescription").value=v.description; $("videoFormHeading").textContent="ভিডিও সম্পাদনা"; }
function reset() { editing=null; $("videoForm").reset(); $("videoFormHeading").textContent="নতুন YouTube ভিডিও"; }
$("videoForm").addEventListener("submit", event => {
  event.preventDefault();
  const title=$("videoTitle").value.trim(), url=$("videoUrl").value.trim(), description=$("videoDescription").value.trim();
  const id=extractYouTubeId(url);
  if (!title || !id) { $("videoMsg").textContent="সঠিক শিরোনাম এবং YouTube ভিডিও লিংক দিন।"; return; }
  if (videos.some(v => v.id===id && v.id!==editing)) { $("videoMsg").textContent="এই ভিডিওটি তালিকায় আগে থেকেই আছে।"; return; }
  const next={id,title,url:`https://www.youtube.com/watch?v=${id}`,description};
  videos=editing ? videos.map(v=>v.id===editing?next:v) : [...videos,next];
  persist(); render(); reset(); $("videoMsg").textContent="ভিডিওটি এই ব্রাউজারে সংরক্ষিত হয়েছে। প্রকাশ করতে JSON রপ্তানি করে GitHub-এ দিতে হবে।";
});
$("videoReset").addEventListener("click", reset);
$("videoExport").addEventListener("click", () => {
  const blob=new Blob([JSON.stringify(videos,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="videos.json"; a.click(); URL.revokeObjectURL(url);
  $("videoTransferMsg").textContent="videos.json ডাউনলোড হয়েছে। GitHub-এর site-overrides/videos.json ফাইলে এটি আপলোড করে Commit changes করুন।";
});
$("videoImport").addEventListener("change", async event => {
  const file=event.target.files?.[0]; if(!file)return;
  try { videos=normalizeVideos(JSON.parse(await file.text())); persist(); render(); $("videoTransferMsg").textContent="ভিডিও তালিকা আমদানি হয়েছে।"; }
  catch(error) { $("videoTransferMsg").textContent=error.message; }
  event.target.value="";
});
try { videos=normalizeVideos(JSON.parse(localStorage.getItem(KEY)||"[]")); } catch { videos=[]; }
fetch("videos.json",{cache:"no-store"}).then(r=>r.ok?r.json():[]).then(data=>{ if(!videos.length && Array.isArray(data)){videos=normalizeVideos(data);persist();render();} }).catch(()=>{});
render();
