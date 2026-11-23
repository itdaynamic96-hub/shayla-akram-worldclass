const modules=await(await fetch("modules.json")).json();
const icons=["◈","✧","◷","☼","◉","☾","♙","♧","▤","✦","▧","▷","▤","۞","⌖","✎","◇","◎","♡","✧","✚","♧","♙","◫","⌂"];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const card=(m,i)=>`<a class="card" href="module.html?id=${m.id}"><span class="card-icon">${icons[i%icons.length]}</span><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p><span class="more">বিস্তারিত দেখুন ↗</span></a>`;
const mosque=document.getElementById("mosque-modules");if(mosque)mosque.innerHTML=modules.filter(m=>m.group==="mosque").map((m,i)=>card(m,i)).join("");
const foundation=document.getElementById("foundation-modules-grid");if(foundation)foundation.innerHTML=modules.filter(m=>m.group==="foundation").map((m,i)=>card(m,i+16)).join("");
document.getElementById("menubtn")?.addEventListener("click",()=>document.getElementById("navlinks")?.classList.toggle("open"));
try{const entries=await(await fetch("content.json",{cache:"no-store"})).json();const host=document.getElementById("latest-list");const rows=entries.filter(x=>x?.published===true).sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||""))).slice(0,8);if(host&&rows.length)host.innerHTML=rows.map(x=>`<a class="notice" href="module.html?id=${Number(x.moduleId)}"><b>${esc(x.title)}</b><div>${esc(x.summary||x.body||"").slice(0,180)}</div><small>${esc(modules.find(m=>m.id===Number(x.moduleId))?.title||"প্রকাশনা")}</small></a>`).join("");}catch(e){console.warn("Public content unavailable",e);}
