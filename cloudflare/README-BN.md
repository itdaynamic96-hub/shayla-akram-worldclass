# World-Class Hybrid — Cloudflare Free Backend

এই backend কেবল `shayla-akram-worldclass` প্রকল্পের জন্য। অন্য কোনো মসজিদ ওয়েবসাইটের Supabase/Appwrite ব্যবহার করে না।

## Free-only resource status

- D1 database: `shayla-worldclass-db` (ID: `4751623a-fcbd-4b68-b5a8-71f20c1fd2a7`)
- Worker: `shayla-worldclass-api` — https://shayla-worldclass-api.itdaynamic96.workers.dev
- Worker D1 binding: `DB` → `shayla-worldclass-db`
- Cloudflare account Free plan; কোনো billing/payment method বা paid upgrade করা হয়নি।
- R2 চালু করা হয়নি। Cloudflare R2 activation screen payment method on file এবং auto-renewal/beyond-free billing-এর কথা বলে; তাই strict no-payment policy-তে এটি ব্যবহার করা হবে না।

**গুরুত্বপূর্ণ:** Worker dashboard-এ বর্তমানে অস্থায়ী Hello World script আছে। GitHub-এ থাকা `src/index.js` এখনো Worker-এ deploy হয়নি। D1 schema migration-ও এখনো চালানো হয়নি। তাই API-কে production-ready বলা যাবে না।

## Repository files

- `cloudflare/src/index.js` — API source (admin sessions, content/video/prayer management, private application/volunteer intake, finance endpoints)
- `cloudflare/migrations/0001_init.sql` — D1 schema and indexes
- `cloudflare/wrangler.toml` — Worker and D1 binding configuration
- `tests/cloudflare-backend.test.mjs` — schema, CORS/privacy and configuration checks

## Cloudflare Worker build settings

Cloudflare Worker Settings → Builds → Connect to GitHub:

- Repository: `itdaynamic96-hub/shayla-akram-worldclass`
- Branch: `main`
- Root directory: repository root (`/`)
- Build command:
  ```sh
npx wrangler d1 migrations apply shayla-worldclass-db --remote --config cloudflare/wrangler.toml && npx wrangler deploy --config cloudflare/wrangler.toml
```

Cloudflare GitHub integration requires the account owner to sign in to GitHub and approve repository access. Never share GitHub passwords, passkeys, or OTPs in chat.

## Required Worker secrets before enabling public forms/admin setup

Configure these under Worker → Settings → Variables and Secrets:

- `SETUP_TOKEN` (Secret): a strong one-time setup token. Use it to create the first admin account at `POST /api/admin/setup`, then remove/rotate it after setup.
- `TURNSTILE_SECRET` (Secret): secret from a Cloudflare Turnstile widget for `itdaynamic96-hub.github.io`.

The Turnstile site key is public and must be set in the website's `assets/app-config.js`. Until both keys and the form integration are configured and tested, public personal-data forms must remain closed.

## API smoke tests after deployment

1. `GET /api/health` must return `{"ok":true,"service":"worldclass-api"}`.
2. `GET /api/setup/migrate` creates the idempotent schema only if the `admin_users` table is absent; it returns the table names. Prefer the Wrangler migration command above for deployment.
3. `GET /api/public/bootstrap` returns only published content, public YouTube video metadata, and prayer times; response is cached for 60 seconds.
4. `GET /api/admin/data` must return 401 without a valid admin session.
5. Applications, volunteer records and financial entries are never included in the public bootstrap response.

## Media limits under strict free-only policy

- YouTube video URL management can work without R2 after the API is deployed.
- Direct binary image/video upload is not enabled because R2 activation currently asks for a payment method and may bill beyond the free allowance.
- Public images can be committed as static website assets in the GitHub repository; do not upload private documents or sensitive applicant files to the public repository.

## Verification

GitHub Actions checks the 25-module static website, JavaScript syntax, existing YouTube tests, Worker syntax, D1 schema structure, private/public data separation and Worker configuration. Passing CI does not mean the Cloudflare Worker has been deployed or live database operations have been tested.

## বিকল্প Deploy পদ্ধতি — GitHub Actions

Cloudflare-এর নিজস্ব Builds-এ পুরোনো migration conflict হলে এই আলাদা workflow ব্যবহার করুন। এটি শুধু Worker deploy করে; D1 migration চালায় না এবং কোনো ডেটা মুছে না।

1. Cloudflare Dashboard → My Profile → API Tokens → Create Token থেকে custom token তৈরি করুন।
2. প্রয়োজনীয় permission দিন: Account → Workers Scripts → Edit এবং Account → Account Settings → Read। শুধু এই Cloudflare account-এ সীমাবদ্ধ রাখুন।
3. GitHub repository → Settings → Secrets and variables → Actions → New repository secret খুলুন।
4. Secret name দিন CLOUDFLARE_API_TOKEN; Cloudflare token value সেখানে দিন। Token কখনো chat, source code বা README-তে লিখবেন না।
5. GitHub repository → Actions → Deploy World-Class Hybrid Cloudflare Worker → Run workflow চাপুন।
6. সফল হলে Worker URL-এ /api/health খুলে ok: true দেখা যাচ্ছে কি না যাচাই করুন।

এই workflow manual trigger-এ সীমাবদ্ধ; Secret যোগ না করা পর্যন্ত কোনো deploy হবে না। Workflow সফল হওয়া মানেই frontend API integration বা public forms/admin setup সম্পন্ন নয়—সেগুলো আলাদাভাবে সংযুক্ত ও পরীক্ষা করতে হবে।
