# World-Class Hybrid — Cloudflare Free Backend

এই backend কেবল **shayla-akram-worldclass** প্রকল্পের জন্য। অন্য কোনো ওয়েবসাইটের Supabase/Appwrite ব্যবহার করে না।

## Live resource ও বর্তমান অবস্থা

- GitHub Pages: https://itdaynamic96-hub.github.io/shayla-akram-worldclass/
- Worker: https://shayla-worldclass-api.itdaynamic96.workers.dev
- D1: **shayla-worldclass-db**
- Worker binding: **DB**
- Worker health endpoint লাইভ পরীক্ষা করা হয়েছে; **ok: true** ফেরত দিয়েছে।
- D1 schema initialization সম্পন্ন; ১০টি প্রয়োজনীয় অ্যাপ্লিকেশন টেবিল তৈরি হয়েছে।
- Cloudflare Turnstile widget তৈরি এবং **TURNSTILE_SECRET** Worker secret হিসেবে সংরক্ষিত।
- Turnstile public site key: **0x4AAAAAAGPk11jgYMKSZhj0** (এটি গোপন নয়)।
- Frontend public bootstrap, module content, video gallery, admin UI ও intake form Worker API-র সঙ্গে সংযুক্ত।
- R2, paid plan, billing, payment method বা auto-renew চালু করা হয়নি।

## শেষ ধাপ: প্রথম অ্যাডমিন তৈরি

নিরাপত্তার কারণে প্রথম অ্যাডমিন স্বয়ংক্রিয়ভাবে তৈরি করা হয়নি। **SETUP_TOKEN** এখনো যোগ করতে হবে।

1. Cloudflare Dashboard → Workers & Pages → shayla-worldclass-api → Settings → Variables and Secrets খুলুন।
2. Secret যোগ করুন:
   - Name: **SETUP_TOKEN**
   - Value: setup.html পেজে **নিরাপদ সেটআপ টোকেন তৈরি** চাপলে যে ৬৪-হেক্স অক্ষরের টোকেন তৈরি হবে।
3. GitHub Pages-এ setup.html খুলুন। একই টোকেনটি সেখানে দিন, একটি username এবং কমপক্ষে ১৪ অক্ষরের শক্তিশালী password বেছে নিয়ে প্রথম admin তৈরি করুন।
4. সফল হওয়ার সঙ্গে সঙ্গে Cloudflare Worker Settings থেকে **SETUP_TOKEN** secret মুছে দিন।
5. admin.html-এ গিয়ে লগইন করুন।

**কখনো SETUP_TOKEN, admin password, Cloudflare API token বা Turnstile secret source code/GitHub repository/chat-এ রাখবেন না।**

## API routes

- GET /api/health — Worker ও D1 health
- GET /api/setup/migrate — idempotent schema initialization; বর্তমান database already initialized
- GET /api/public/bootstrap — কেবল প্রকাশিত content, YouTube video metadata ও prayer times
- POST /api/intake — Turnstile-verified application/volunteer intake
- POST /api/admin/setup — একবারের admin bootstrap, requires SETUP_TOKEN
- POST /api/admin/login — rate-limited login
- GET /api/admin/data — authenticated private admin data
- /api/admin/content, /video, /prayer, /finance — authenticated management
- /api/admin/application/status, /volunteer/status — authenticated review updates

ব্যক্তিগত আবেদন, ফোন, ঠিকানা ও অর্থের হিসাব কখনো public bootstrap response-এ থাকে না।

## Free-only media policy

YouTube URL-ভিত্তিক ভিডিও গ্যালারি চালু। Direct binary media upload/R2 চালু করা হয়নি, কারণ এই প্রকল্পে payment method বা paid usage অনুমোদিত নয়। Public image/static assets GitHub repository-তে রাখা যায়; private applicant documents কখনো public repository-তে দেবেন না।

## CI ও verification

GitHub Actions Pages workflow এখন static structure, module counts, JavaScript syntax, Cloudflare Worker security checks, YouTube tests এবং frontend API integration tests চালায়। Worker deploy workflow আলাদা। CI pass হওয়া browser end-to-end test বা প্রথম admin setup সম্পন্ন হওয়ার সমান নয়।
