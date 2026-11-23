# সাকছিপাড়া শায়লা আকরাম কেন্দ্রীয় জামে মসজিদ ও ফাউন্ডেশন
## World-Class Hybrid — GitHub Pages + Cloudflare Free

এই প্রকল্পে ২৫টি মডিউল রয়েছে: মসজিদ ০১–১৬ এবং ফাউন্ডেশন ২৬–৩৪। Frontend GitHub Pages-এ এবং আলাদা backend Cloudflare Worker + D1-এ চলে।

### Live links

- Website: https://itdaynamic96-hub.github.io/shayla-akram-worldclass/
- Admin login: https://itdaynamic96-hub.github.io/shayla-akram-worldclass/admin.html
- First admin setup: https://itdaynamic96-hub.github.io/shayla-akram-worldclass/setup.html
- Support application: https://itdaynamic96-hub.github.io/shayla-akram-worldclass/apply.html
- Volunteer registration: https://itdaynamic96-hub.github.io/shayla-akram-worldclass/volunteer.html
- Video gallery: https://itdaynamic96-hub.github.io/shayla-akram-worldclass/videos.html
- API health: https://shayla-worldclass-api.itdaynamic96.workers.dev/api/health

### Implemented

- ২৫টি মডিউল ও responsive website
- Cloudflare Worker API ও D1 schema
- Public content/video/prayer-time bootstrap endpoint
- API-connected module pages ও YouTube gallery
- Turnstile-protected private application and volunteer forms
- Authenticated admin dashboard for content, video, prayer times, applications, volunteers and finance
- PBKDF2 password hashing, hashed sessions, ৮ ঘণ্টার session expiry, login throttling and audit log
- GitHub Actions automated Pages and Worker deploy workflows

### Remaining one-time owner action

প্রথম অ্যাডমিন account তৈরির আগে Worker-এ একটি secret যোগ করতে হবে। বিস্তারিত cloudflare/README-BN.md এবং setup.html-এ আছে। এটি ইচ্ছাকৃত নিরাপত্তা ধাপ; কোনো public visitor-কে প্রথম admin account তৈরি করার সুযোগ দেওয়া হয়নি।

### Free-only policy

Cloudflare Free + GitHub Pages ব্যবহার করা হচ্ছে। R2, paid plan, billing, payment method বা auto-renew চালু করা হয়নি। Direct file uploads নেই; ভিডিও YouTube URL দিয়ে যোগ হবে।

### Project isolation

এই repository ও backend অন্য কোনো মসজিদ প্রকল্পের Supabase/Appwrite backend, database, storage বা content-এর সঙ্গে শেয়ার করা হয় না।
