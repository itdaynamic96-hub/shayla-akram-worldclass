const form=document.getElementById("intakeForm"),API=(window.APP_CONFIG?.apiBase||"").replace(/\/$/,""),siteKey=window.APP_CONFIG?.turnstileSiteKey||"";
let challengeToken="",widgetId=null;
const message=document.getElementById("formMsg");
function say(text){message.textContent=text;}
const MAX_WORDS=500;
const countWords=value=>(String(value||"").trim().match(/\S+/g)||[]).length;
const clampWords=(value,max)=>{let n=0;return(String(value||"").match(/\S+|\s+/g)||[]).filter(part=>{if(!/\S/.test(part))return true;if(n>=max)return false;n++;return true}).join("")};
if(form){for(const id of ["name","address","details","skills"]){const field=document.getElementById(id);if(!field)continue;const counter=document.createElement("small");counter.className="muted";counter.textContent="০ / ৫০০ শব্দ";field.parentElement.append(counter);const update=()=>{if(countWords(field.value)>MAX_WORDS){field.value=clampWords(field.value,MAX_WORDS);say("প্রতিটি লেখার ঘরে সর্বোচ্চ ৫০০ শব্দ রাখা যাবে।")}counter.textContent=countWords(field.value)+" / ৫০০ শব্দ"};field.addEventListener("input",update);field.addEventListener("paste",event=>{const pasted=(event.clipboardData||window.clipboardData).getData("text");if(countWords(field.value+" "+pasted)>MAX_WORDS){event.preventDefault();say("পেস্টসহ সর্বোচ্চ ৫০০ শব্দ রাখা যাবে।")}});}}
function mountChallenge(){
 if(!form||!window.turnstile||!siteKey||widgetId!==null)return;
 widgetId=window.turnstile.render("#turnstile",{sitekey:siteKey,callback:value=>{challengeToken=value;say("");}, "expired-callback":()=>{challengeToken="";say("নিরাপত্তা যাচাইয়ের মেয়াদ শেষ হয়েছে। আবার যাচাই করুন।");},"error-callback":()=>{challengeToken="";say("নিরাপত্তা যাচাই লোড হয়নি। পৃষ্ঠা রিফ্রেশ করে চেষ্টা করুন।");}});
}
if(window.turnstile)mountChallenge();else window.addEventListener("load",mountChallenge);
const observer=setInterval(()=>{if(window.turnstile){mountChallenge();clearInterval(observer);}},300);
form?.addEventListener("submit",async event=>{
 event.preventDefault();
 if(!challengeToken){say("আগে Cloudflare নিরাপত্তা যাচাই সম্পন্ন করুন।");return;}
 const fd=new FormData(form),data={};
 for(const key of ["name","phone","address","category","details","skills"])if(fd.has(key))data[key]=String(fd.get(key)||"").trim();
 if(["name","address","details","skills"].some(id=>{const field=document.getElementById(id);return field&&countWords(field.value)>MAX_WORDS})){say("প্রতিটি লেখার ঘরে সর্বোচ্চ ৫০০ শব্দ রাখা যাবে।");return;}
 const button=form.querySelector("button[type=submit]");button.disabled=true;say("তথ্য নিরাপদে জমা হচ্ছে...");
 try{
  const response=await fetch(API+"/api/intake",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:form.dataset.kind,data,website:String(fd.get("website")||""),turnstileToken:challengeToken})});
  const result=await response.json().catch(()=>({error:"সার্ভারের উত্তর পাওয়া যায়নি।"}));
  if(!response.ok)throw Error(result.error||"আবেদন জমা হয়নি।");
  form.reset();challengeToken="";if(window.turnstile&&widgetId!==null)window.turnstile.reset(widgetId);
  say("আপনার তথ্য জমা হয়েছে। রেফারেন্স নম্বর: "+result.referenceCode+"। এটি সংরক্ষণ করে রাখুন।");
 }catch(error){say(error.message);}
 finally{button.disabled=false;}
});
