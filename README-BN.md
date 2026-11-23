# সাকছিপাড়া শায়লা আকরাম কেন্দ্রীয় জামে মসজিদ ও ফাউন্ডেশন
## World-Class Hybrid — আলাদা নতুন ওয়েবসাইট

এই আলাদা প্রকল্পে ২৫টি মডিউলের ক্যাটালগ (মসজিদ ০১–১৬, ফাউন্ডেশন ২৬–৩৪), responsive homepage, module detail pages, প্রাথমিক content admin login, application ও volunteer form-এর UI এবং GitHub Pages deployment workflow রয়েছে।

## গুরুত্বপূর্ণ অবস্থা
- `site-source.tar.gz`-এ ওয়েবসাইটের deployযোগ্য static files রয়েছে। GitHub Actions workflow এই archive খুলে Pages-এ প্রকাশ করে।
- Appwrite project, database, tables, team, bucket, function ও admin account এখনো নতুন করে তৈরি/configure করতে হবে। কোনো পুরোনো Appwrite project ID এখানে ব্যবহার করবেন না।
- Admin panel আপাতত সাধারণ content create/edit/delete-এর জন্য। আবেদন/স্বেচ্ছাসেবক ব্যবস্থাপনা, হিসাব, gallery upload বা সব ২৫ মডিউলের পূর্ণ workflow চালু হয়েছে বলে ধরে নেবেন না।
- Appwrite integration বাস্তব project-এ এখনো পরীক্ষা করা হয়নি।

## GitHub Pages
Repository Settings → Pages → Build and deployment → Source: **GitHub Actions** নির্বাচন করুন। এরপর `main` branch-এ push হলে workflow চলবে। Actions run সফল হওয়ার পর `https://OWNER.github.io/REPOSITORY/`-এ পরীক্ষা করুন।

## Appwrite
নতুন project তৈরি করে Web platform, database ও প্রয়োজনীয় tables/permissions স্থাপন করুন। `assets/app-config.js`-এ নতুন project-এর public identifiers এবং সঠিক region endpoint বসাতে হবে। Browser config-এ কখনো API key/password/secret রাখবেন না।

`functions/intake/index.js` হলো application/volunteer intake-এর server-side scaffold; deploy, configure, abuse protection এবং integration test শেষ না হওয়া পর্যন্ত public form-এ বাস্তব/সংবেদনশীল তথ্য সংগ্রহ করবেন না।

## Local checks
Project folder-এ `npm test` এবং `npm run check` চালান। এগুলো structural ও syntax checks; browser/Appwrite live integration test নয়।
