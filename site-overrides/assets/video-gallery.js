import { normalizeVideos, embedUrl } from "./youtube.mjs";
const root = document.getElementById("videoGallery");
const status = document.getElementById("galleryStatus");
if (root) {
  fetch("videos.json", { cache: "no-store" })
    .then(response => { if (!response.ok) throw new Error("ভিডিও তালিকা পাওয়া যায়নি"); return response.json(); })
    .then(data => {
      const videos = normalizeVideos(data);
      if (!videos.length) { root.innerHTML = '<div class="adminbox"><h2>ভিডিও শিগগিরই যুক্ত হবে</h2><p>এখনো কোনো ভিডিও প্রকাশ করা হয়নি।</p></div>'; return; }
      root.innerHTML = videos.map(video => `<article class="video-card"><div class="video-frame"><iframe src="${embedUrl(video.id)}" title="${escapeHtml(video.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><div class="video-copy"><h2>${escapeHtml(video.title)}</h2><p>${escapeHtml(video.description)}</p><a href="${video.url}" target="_blank" rel="noopener noreferrer">YouTube-এ দেখুন ↗</a></div></article>`).join("");
    })
    .catch(error => { root.innerHTML = '<div class="adminbox"><h2>ভিডিও লোড করা যায়নি</h2><p>পরে আবার চেষ্টা করুন।</p></div>'; if(status) status.textContent = error.message; });
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
