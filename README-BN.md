# সাকছিপাড়া শায়লা আকরাম কেন্দ্রীয় জামে মসজিদ ও ফাউন্ডেশন
## World-Class Hybrid — আলাদা নতুন ওয়েবসাইট

এই আলাদা প্রকল্পে ২৫টি মডিউলের ক্যাটালগ (মসজিদ ০১–১৬, ফাউন্ডেশন ২৬–৩৪), responsive homepage, module detail pages, প্রাথমিক content admin login, application ও volunteer form-এর UI এবং GitHub Pages deployment workflow রয়েছে।

## বর্তমান অবস্থা
- `site-source.tar.gz`-এ মূল static website files রয়েছে। GitHub Actions archive extract করে `site-overrides/`-এর ফাইল যোগ করে GitHub Pages-এ প্রকাশ করে।
- হোমপেজে মডিউল তালিকা, কাউন্টার ও ফাউন্ডেশন overview দেখানো হয় না; মসজিদ/ফাউন্ডেশনের বিভাগ বহুস্তর মেনু থেকে খোলা যায়।
- মেনুতে সিরিয়াল নম্বর ছাড়া উপবিভাগ, সহায়তার আবেদন, স্বেচ্ছাসেবক নিবন্ধন, নোটিশ, যোগাযোগ ও অ্যাডমিন লিংক রয়েছে।
- সর্বশেষ আগের deployment workflow সফল হয়েছে। নতুন workflow-তে হোমপেজ ও মডিউল পৃষ্ঠায় Appwrite public configuration লোড করার ধাপও যুক্ত হয়েছে; এই পরিবর্তনের deployment run শেষ না হওয়া পর্যন্ত এটিকে প্রকাশিত বলা যাবে না।
- ২৫টি মডিউল, ১৬টি মসজিদ বিভাগ, ৯টি ফাউন্ডেশন বিভাগ, unique module ID, JavaScript syntax এবং প্রয়োজনীয় পেজ workflow-এ যাচাই হয়।
- Appwrite project, database, tables, team, bucket, function ও admin account এখনো এই নতুন সাইটের জন্য তৈরি/configure হয়নি। `assets/app-config.js`-এ placeholder আছে।
- Admin panel এখন শুধু সাধারণ content create/edit/delete করতে পারে। আবেদন review, volunteer management, finance, gallery upload, prayer-time editing এবং পূর্ণ ২৫-মডিউল workflow এখনো চালু বা live-tested নয়।
- `functions/intake/index.js` application/volunteer intake-এর server-side scaffold। Function deployment, configuration, abuse protection এবং integration test না হওয়া পর্যন্ত প্রকৃত/সংবেদনশীল আবেদন সংগ্রহ করবেন না।

## GitHub Pages
Repository Settings → Pages → Build and deployment → Source: **GitHub Actions** নির্বাচন থাকতে হবে। `main` branch-এ push হলে workflow চলবে। সফল run-এর পর:
`https://itdaynamic96-hub.github.io/shayla-akram-worldclass/`

## Appwrite সেটআপ
`APPWRITE-SETUP-BN.md`-এ নতুন Appwrite project, Web platform, database, table, permissions, team, storage ও Function-এর প্রয়োজনীয় সেটআপ দেওয়া আছে। কোনো পুরোনো Appwrite Project ID পুনর্ব্যবহার করবেন না। Browser config-এ শুধু public identifiers থাকবে; API key, password বা secret কখনো নয়।

## যাচাই
GitHub Actions-এর **Validate website files** ধাপে module counts, unique IDs, প্রয়োজনীয় ফাইল, configuration script inclusion এবং JavaScript syntax পরীক্ষা হয়। এটি browser-এর end-to-end test বা live Appwrite integration test নয়। এই repository-তে `npm test` বা `npm run check` নামে root-level script নেই—তাই ওই command-গুলো চালানোর নির্দেশ প্রযোজ্য নয়।

## নিরাপত্তা
- applications ও volunteers-এর ব্যক্তিগত তথ্য private রাখতে হবে; public read permission দেওয়া যাবে না।
- financial records শুধু নির্দিষ্ট finance/admin role দেখতে ও সম্পাদনা করতে পারবে।
- CAPTCHA/abuse protection, role permissions, privacy notice, data retention ও backup/restore পরীক্ষা ছাড়া সংবেদনশীল আবেদন চালু করবেন না।
- বর্তমান Appwrite account-এর project quota পূর্ণ; নতুন পৃথক Appwrite backend তৈরি না হওয়া পর্যন্ত পুরোনো project পরিবর্তন বা মুছে এই সাইট চালু করা হবে না।
