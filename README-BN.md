# সাকছিপাড়া শায়লা আকরাম কেন্দ্রীয় জামে মসজিদ ও ফাউন্ডেশন
## World-Class Hybrid — GitHub Pages Static Mode

এই আলাদা প্রকল্পে ২৫টি মডিউলের ক্যাটালগ রয়েছে: মসজিদ ০১–১৬ এবং ফাউন্ডেশন ২৬–৩৪। মূল ওয়েবসাইট GitHub Pages-এ প্রকাশিত হয়।

## বর্তমান বাস্তব অবস্থা
- হোমপেজ, বহুস্তর মেনু, ২৫টি মডিউল এবং মডিউল-ভিত্তিক তথ্য দেখানোর ব্যবস্থা রয়েছে।
- Appwrite account-এর Free project limit পূর্ণ এবং Supabase/অন্য কোনো backend account সংযুক্ত করা হয়নি। তাই এই সংস্করণে server-side database নেই।
- নিরাপদ বিকল্প হিসেবে public website-কে static JSON content mode-এ রাখা হয়েছে। এতে কোনো backend key বা secret লাগে না।
- `admin.html` একটি local browser content editor: খসড়া তৈরি/সম্পাদনা, JSON import/export করা যায়। এটি নিরাপদ admin login নয়; ডেটা শুধু একই কম্পিউটার/ব্রাউজারের localStorage-এ থাকে।
- কনটেন্ট সবার ওয়েবসাইটে প্রকাশ করতে `content.json` export করে repository-র `site-overrides/content.json` ফাইলে commit করতে হবে। GitHub Actions সফল হলে Pages-এ প্রকাশ হবে। এটি এখনো স্বয়ংক্রিয় নয়।
- সহায়তার আবেদন ও স্বেচ্ছাসেবক নিবন্ধন পৃষ্ঠা সাময়িকভাবে বন্ধ রাখা হয়েছে। ব্যক্তিগত তথ্য জমা নেওয়ার কোনো সক্রিয় endpoint নেই।
- Prayer-time database sync, media storage/upload, direct 50 MB video upload, YouTube gallery management, private application review, volunteer records, finance ledger, staff roles এবং পূর্ণ multi-user admin এখনো চালু নয়।

## প্রকাশিত ওয়েবসাইট
https://itdaynamic96-hub.github.io/shayla-akram-worldclass/

## স্থানীয় কনটেন্ট সম্পাদনা
1. ওয়েবসাইটের `admin.html` খুলুন।
2. মডিউল, শিরোনাম ও বিস্তারিত লেখা দিন; প্রকাশের জন্য প্রস্তুত নির্বাচন করুন।
3. **প্রকাশিত JSON রপ্তানি** চাপুন।
4. GitHub repository-তে `site-overrides/content.json` খুলে Edit করে রপ্তানি করা JSON বসিয়ে Commit changes করুন।
5. Actions-এর Deploy workflow সফল হলে পরিবর্তন public site-এ দেখা যাবে।

**সতর্কতা:** local editor-এ আবেদনকারীর নাম, ফোন, ঠিকানা, চিকিৎসা, আর্থিক বা অন্য ব্যক্তিগত তথ্য রাখবেন না। এটি ব্যক্তিগত তথ্যের নিরাপদ সংরক্ষণ ব্যবস্থা নয়।

## যাচাই
GitHub Actions workflow-এ ২৫টি মডিউল, ১৬টি মসজিদ, ৯টি ফাউন্ডেশন, unique IDs, content JSON structure, JavaScript syntax, static-mode dependencies এবং আবেদন/স্বেচ্ছাসেবক পেজের নিরাপদ বন্ধ অবস্থা পরীক্ষা করা হয়। Workflow pass হওয়া browser end-to-end test বা live backend integration test নয়।

কোনো পুরোনো Appwrite/Supabase project পরিবর্তন বা মুছে ফেলা হয়নি।
