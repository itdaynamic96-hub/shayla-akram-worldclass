# সাকছিপাড়া শায়লা আকরাম কেন্দ্রীয় জামে মসজিদ ও ফাউন্ডেশন

## World-Class Hybrid — নতুন ও স্বতন্ত্র ওয়েবসাইট

এই repository পুরোনো ২০-মডিউল ওয়েবসাইট থেকে সম্পূর্ণ আলাদা।

## আপলোড করা ফাইল
- `site-source.tar.gz` — ওয়েবসাইটের static source files; GitHub Pages workflow এটি extract করে deploy করবে।
- `APPWRITE-SETUP-BN.md` — নতুন Appwrite project, tables, team ও security setup guide.
- `functions/intake/` — application/volunteer intake Function source scaffold.
- `README-BN.md` — প্রকল্পের অবস্থা ও সীমাবদ্ধতা।

## GitHub Pages চালু করুন
Repository Settings → Pages → Build and deployment → Source: **GitHub Actions** নির্বাচন করুন। এরপর Actions tab-এ workflow run দেখুন। সফল হলে `https://OWNER.github.io/REPOSITORY/`-এ সাইট পরীক্ষা করুন।

## Appwrite backend
নতুন Appwrite project, database, tables, team, bucket, admin account ও Function configure করা এখনো বাকি। পুরোনো Appwrite project-এর কোনো ID পুনর্ব্যবহার করবেন না। `APPWRITE-SETUP-BN.md` অনুসরণ করুন। Browser config-এ কখনো API key/password/secret রাখবেন না।

## বাস্তবায়নের সীমা
এই upload live Appwrite integration বা full production admin suite নয়। Admin UI আপাতত সাধারণ content create/edit/delete-এর জন্য; sensitive application intake Function deploy, abuse protection ও integration test শেষ না হওয়া পর্যন্ত বাস্তব সংবেদনশীল তথ্য সংগ্রহ করবেন না।
