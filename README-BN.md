# সাকছিপাড়া শায়লা আকরাম কেন্দ্রীয় জামে মসজিদ ও ফাউন্ডেশন
## World-Class Hybrid — GitHub Pages + Cloudflare Free প্রস্তুতি

এই আলাদা প্রকল্পে ২৫টি মডিউলের ক্যাটালগ রয়েছে: মসজিদ ০১–১৬ এবং ফাউন্ডেশন ২৬–৩৪। মূল ওয়েবসাইট GitHub Pages-এ প্রকাশিত হয়।

## বর্তমান বাস্তব অবস্থা
- হোমপেজ, বহুস্তর মেনু, ২৫টি মডিউল এবং মডিউল-ভিত্তিক তথ্য দেখানোর ব্যবস্থা রয়েছে।
- Cloudflare Free-এ এই প্রকল্পের জন্য আলাদা D1 database `shayla-worldclass-db` ও Worker `shayla-worldclass-api` তৈরি হয়েছে; Worker-এ D1 binding `DB` সংযুক্ত।
- Cloudflare Workers Builds-এ শুধু এই repository `itdaynamic96-hub/shayla-akram-worldclass`, branch `main`, root `/` যুক্ত করা হয়েছে। Build command D1 migration চালায় এবং Deploy command Worker deploy করে। Git integration প্রস্তুত; প্রথম সফল deployment ও migration-এর ফল যাচাই না হওয়া পর্যন্ত live backend চালু হয়েছে বলা যাবে না।
- Worker API source: `cloudflare/src/index.js`; D1 schema: `cloudflare/migrations/0001_init.sql`; বাংলা নির্দেশনা: `cloudflare/README-BN.md`।
- `admin.html`-এর পুরোনো local browser editor নিরাপদ অনলাইন admin login নয়। Cloudflare Worker deploy ও front-end integration সম্পূর্ণ এবং পরীক্ষা না হওয়া পর্যন্ত এটি production admin হিসেবে ব্যবহার করবেন না।
- `video-admin.html` দিয়ে YouTube URL, শিরোনাম ও বিবরণ যোগ/সম্পাদনা/মুছে ফেলা যায়। পুরোনো workflow-তে ভিডিও তালিকা localStorage-এ থাকে এবং `videos.json` export/import করা যায়।
- YouTube gallery `videos.html`-এ privacy-enhanced `youtube-nocookie.com` embed ব্যবহার করে। কেবল HTTPS YouTube URL গ্রহণ করা হয়; watch, youtu.be, embed, shorts ও live URL সমর্থিত।
- YouTube URL যোগ করা মানে YouTube-এ ভিডিও ফাইল আপলোড নয়। ভিডিওটি আগে YouTube-এ আপলোড করা থাকতে হবে এবং embed অনুমোদিত হতে হবে।
- সহায়তার আবেদন ও স্বেচ্ছাসেবক নিবন্ধন সক্রিয় backend endpoint ও Turnstile secret যাচাই না হওয়া পর্যন্ত বন্ধ থাকবে।
- Direct video file upload/media storage, prayer-time database sync, private application review, volunteer records, finance ledger ও staff roles এখনো live হিসেবে নিশ্চিত নয়।
- R2 বা অন্য কোনো paid service, billing, paid plan বা auto-renew চালু করা হয়নি। এই সংস্করণে YouTube URL-ভিত্তিক ভিডিও ব্যবস্থাই বিনা খরচের বিকল্প।

## প্রকাশিত ওয়েবসাইট
https://itdaynamic96-hub.github.io/shayla-akram-worldclass/

## YouTube ভিডিও যুক্ত করার ধাপ
1. `video-admin.html` খুলুন।
2. ভিডিওর শিরোনাম ও YouTube URL দিন; চাইলে বিবরণ লিখুন।
3. ভিডিও সংরক্ষণ করুন। এটি এই ব্রাউজারে local ভাবে রাখা হবে।
4. **ভিডিও JSON রপ্তানি** চাপুন।
5. GitHub repository-তে `site-overrides/videos.json` সম্পাদনা করে export করা JSON বসিয়ে Commit changes করুন।
6. GitHub Actions deploy সফল হলে `videos.html`-এ ভিডিও দেখা যাবে।

## সাধারণ কনটেন্ট প্রকাশ
1. `admin.html` খুলে মডিউল কনটেন্ট তৈরি করুন।
2. প্রকাশিত JSON রপ্তানি করুন।
3. GitHub-এ `site-overrides/content.json`-এ JSON বসিয়ে commit করুন।
4. Actions deploy সফল হলে পরিবর্তন প্রকাশিত হবে।

**সতর্কতা:** local editor-এ আবেদনকারীর নাম, ফোন, ঠিকানা, চিকিৎসা, আর্থিক বা অন্য ব্যক্তিগত তথ্য রাখবেন না। এটি ব্যক্তিগত তথ্যের নিরাপদ সংরক্ষণ ব্যবস্থা নয়।

## যাচাই
GitHub Actions workflow-এ মডিউল গণনা, JSON structure, JavaScript syntax, YouTube URL parsing ও নিরাপদ embed URL-এর unit test এবং আবেদন/স্বেচ্ছাসেবক পেজের বন্ধ অবস্থা যাচাই করা হয়। Workflow pass হওয়া browser end-to-end বা live backend test নয়।

কোনো পুরোনো Appwrite/Supabase project পরিবর্তন বা মুছে ফেলা হয়নি।
