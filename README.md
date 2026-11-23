# সাকছিপাড়া শায়লা আকরাম কেন্দ্রীয় জামে মসজিদ ও ফাউন্ডেশন

## World-Class Hybrid — নতুন ও স্বতন্ত্র ওয়েবসাইট

এই repository-টি পুরোনো ২০-মডিউল ওয়েবসাইট থেকে সম্পূর্ণ আলাদা। এখানে নতুন World-Class Hybrid ডিজাইনের ২৫-মডিউল ওয়েবসাইটের source code রাখা হবে।

## Source package

প্রস্তুত source package ও বাংলা Appwrite setup guide ChatGPT কথোপকথনে দেওয়া ডাউনলোড ফাইল থেকে নিন। সব ফাইল repository-র root-এ একই folder structure বজায় রেখে upload করতে হবে।

## Deployment status

এই repository এখনো source package দিয়ে পূর্ণ করা হয়নি। GitHub Pages deployment চালু হয়েছে—এমন দাবি করা হচ্ছে না। Appwrite backend-ও এখনো নতুন project-এর সঙ্গে configure করা হয়নি।

## Setup

1. সম্পূর্ণ source package-এর সব ফাইল repository-তে upload করুন।
2. Repository Settings → Pages → Build and deployment থেকে GitHub Actions নির্বাচন করুন।
3. Appwrite-এর জন্য `APPWRITE-SETUP-BN.md` অনুসরণ করে আলাদা নতুন project, database, tables, team, storage bucket ও intake function তৈরি করুন।
4. নতুন public identifiers `assets/app-config.js`-এ বসান। Browser config-এ কখনো API key বা secret রাখবেন না।
5. GitHub Actions সফল হলে Pages URL পরীক্ষা করুন।

পুরোনো Appwrite project বা পুরোনো repository-র কোনো ID এখানে ব্যবহার করবেন না।
