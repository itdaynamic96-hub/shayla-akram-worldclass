const id=Number(new URLSearchParams(location.search).get("id")),modules=await(await fetch("modules.json")).json(),m=modules.find(x=>x.id===id);
const title=document.getElementById("title"),desc=document.getElementById("desc"),host=document.getElementById("module-content");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
if(!m){title.textContent="মডিউল পাওয়া যায়নি";host.textContent="সঠিক মডিউল নির্বাচন করুন।";}
else{title.textContent=m.title;desc.textContent=m.description;document.title=m.title+" | শায়লা আকরাম";
try{let rows=[],api=window.APP_CONFIG?.apiBase;if(api){try{const r=await fetch(api+"/api/public/bootstrap",{cache:"no-store"});if(!r.ok)throw Error("API unavailable");rows=(await r.json()).content||[];}catch(e){console.warn("Cloudflare API unavailable; using static content",e);rows=await(await fetch("content.json",{cache:"no-store"})).json();}}else rows=await(await fetch("content.json",{cache:"no-store"})).json();
const items=rows.filter(x=>(x?.published===true||x?.published===1)&&Number(x.moduleId||x.module_id)===id).sort((a,b)=>String(b.updatedAt||b.updated_at||"").localeCompare(String(a.updatedAt||a.updated_at||"")));
host.innerHTML=items.length?items.map(x=>"<article class='adminbox'><span class='pill'>"+esc(x.dateLabel||"প্রকাশিত")+"</span><h2>"+esc(x.title)+"</h2><div style='white-space:pre-wrap;line-height:1.9;margin-top:12px'>"+esc(x.body)+"</div></article>").join(""):'<div class="notice">এই বিভাগে এখনো কোনো তথ্য প্রকাশ করা হয়নি।</div>';
}catch(e){host.innerHTML='<div class="notice">তথ্য লোড করা যায়নি।</div>';}}
