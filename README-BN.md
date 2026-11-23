# সাকছিপাড়া শায়লা আকরাম কেন্দ্রীয় জামে মসজিদ ও ফাউন্ডেশন
## World-Class Hybrid — GitHub Pages Static Mode

এই আলাদা প্রকল্পে ২৫টি মডিউলের ক্যাটালগ রয়েছে: মসজিদ ০১–১৬ এবং ফাউন্ডেশন ২৬–৩৪। মূল ওয়েবসাইট GitHub Pages-এ প্রকাশিত হয়।

## বর্তমান বাস্তব অবস্থা
- হোমপেজ, বহুস্তর মেনু, ২৫টি মডিউল এবং মডিউল-ভিত্তিক তথ্য দেখানোর ব্যবস্থা রয়েছে।
- Cloudflare Free-এ এই প্রকল্পের জন্য আলাদা D1 database ও Worker resource তৈরি হয়েছে এবং Worker-এ D1 binding `DB` সংযুক্ত। তবে Worker dashboard-এ এখনো Hello World placeholder script আছে; API source deploy ও D1 migration শেষ হয়নি। তাই live backend এখনো চালু নয়।
- `admin.html` একটি local browser content editor; এটি নিরাপদ অনলাইন admin login নয়। কনটেন্ট JSON export করে GitHub repository-তে commit করতে হয়।
- `video-admin.html` দিয়ে YouTube URL, শিরোনাম ও বিবরণ যোগ/সম্পাদনা/মুছে ফেলা যায়। ভিডিও তালিকা localStorage-এ থাকে এবং `videos.json` export/import করা যায়।
- YouTube gallery `videos.html`-এ privacy-enhanced `youtube-nocookie.com` embed ব্যবহার করে। কেবল HTTPS YouTube URL গ্রহণ করা হয়; watch, youtu.be, embed, shorts ও live URL সমর্থিত।
- ভিডিও সবার জন্য প্রকাশ করতে `videos.json` export করে repository-র `site-overrides/videos.json` ফাইলে commit করতে হবে। এটি স্বয়ংক্রিয় publish নয়; local admin panel-এর সংরক্ষণ একই browser-এ সীমাবদ্ধ।
- YouTube URL যোগ করা মানে YouTube-এ ভিডিও ফাইল আপলোড নয়। ভিডিওটি আগে YouTube-এ আপলোড করা থাকতে হবে এবং embed অনুমোদিত হতে হবে।
- সহায়তার আবেদন ও স্বেচ্ছাসেবক নিবন্ধন সাময়িকভাবে বন্ধ; ব্যক্তিগত তথ্য জমা নেওয়ার সক্রিয় endpoint নেই।
- Direct 50 MB video upload, media storage, prayer-time database sync, private application review, volunteer records, finance ledger, staff roles এবং পূর্ণ multi-user admin এখনো চালু নয়।

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
