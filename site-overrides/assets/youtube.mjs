const ALLOWED_HOSTS = new Set(["youtube.com","www.youtube.com","m.youtube.com","youtu.be","www.youtube-nocookie.com","youtube-nocookie.com"]);
export function extractYouTubeId(input) {
  if (typeof input !== "string" || input.length > 2048) return null;
  let url;
  try { url = new URL(input.trim()); } catch { return null; }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return null;
  let id = "";
  if (url.hostname.toLowerCase() === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
  else if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
  else {
    const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})(?:\/|$)/);
    id = match?.[1] || "";
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}
export function normalizeVideos(value) {
  if (!Array.isArray(value)) throw new TypeError("ভিডিও তালিকা অবশ্যই একটি array হতে হবে");
  const seen = new Set();
  return value.map((item, index) => {
    const title = String(item?.title ?? "").trim().slice(0, 160);
    const url = String(item?.url ?? "").trim();
    const videoId = extractYouTubeId(url);
    if (!title || !videoId) throw new TypeError(`ভিডিও ${index + 1}: শিরোনাম বা বৈধ YouTube লিংক নেই`);
    if (seen.has(videoId)) throw new TypeError(`ভিডিও ${index + 1}: একই ভিডিও একাধিকবার যোগ করা হয়েছে`);
    seen.add(videoId);
    return { id: videoId, title, description: String(item?.description ?? "").trim().slice(0, 1000), url: `https://www.youtube.com/watch?v=${videoId}` };
  });
}
export function embedUrl(videoId) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new TypeError("Invalid YouTube video ID");
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
