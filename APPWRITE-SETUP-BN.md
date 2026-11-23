# নতুন Appwrite প্রকল্প — সেটআপ ও নিরাপত্তা

এই সাইটের জন্য **সম্পূর্ণ নতুন Appwrite Project** তৈরি করতে হবে। আগের মসজিদ প্রকল্পের ID, Database, Team বা Bucket পুনর্ব্যবহার করবেন না।

## 1. Project ও Web platform
1. Appwrite Console → Create project; নাম দিন `shayla-akram-worldclass`.
2. Project Settings → Platforms → Add Web app.
3. GitHub Pages-এ প্রকাশের পরে আপনার নতুন GitHub Pages hostname যোগ করুন; local test-এর জন্য `localhost` যোগ করুন।
4. আপনার region অনুযায়ী endpoint নিন। `assets/app-config.js`-এ endpoint/project ID বসান।

## 2. Database ও tables
Database ID `mosque_worldclass_db` তৈরি করুন। নিচের পাঁচটি table তৈরি করুন। Row security **ON** রাখুন।

### site_content
| Column | Type | Required |
|---|---|---|
| moduleId | Integer | yes |
| title | Varchar(250) | yes |
| summary | Text | no |
| body | MediumText | yes |
| category | Varchar(30) | yes |
| published | Boolean | yes |

Permissions: Row security ON. Table-level Read → Any; Create/Update/Delete → Team role `admin` এবং `editor`. প্রতিটি public content row-এ Read → Any এবং Update/Delete → Team role `admin`,`editor` row permissions দিতে হবে। Public visitor-এর create/update/delete দেবেন না.

### prayer_times
| Column | Type | Required |
|---|---|---|
| dateKey | Varchar(10) | yes |
| fajr | Varchar(10) | yes |
| dhuhr | Varchar(10) | yes |
| asr | Varchar(10) | yes |
| maghrib | Varchar(10) | yes |
| isha | Varchar(10) | yes |
| jumuah | Varchar(10) | yes |

Permissions: Row security ON. Table-level Read → Any; Create/Update/Delete → Team role `admin`,`editor`.

### applications (অত্যন্ত গোপনীয়)
| Column | Type | Required |
|---|---|---|
| referenceCode | Varchar(40) | yes |
| category | Varchar(80) | yes |
| name | Varchar(120) | yes |
| phone | Varchar(25) | yes |
| address | Text | yes |
| details | MediumText | yes |
| status | Varchar(30) | yes |
| submittedAt | Varchar(40) | yes |
| reviewedBy | Varchar(40) | no |
| decisionNote | Text | no |

Permissions: Table-level Read/Update/Delete কাউকে দেবেন না। Row security ON. Public browser-কে এই table-এ সরাসরি access দেবেন না। Function private row permission-সহ row তৈরি করবে।

### volunteers (ব্যক্তিগত তথ্য)
| Column | Type | Required |
|---|---|---|
| referenceCode | Varchar(40) | yes |
| name | Varchar(120) | yes |
| phone | Varchar(25) | yes |
| address | Text | yes |
| skills | Text | yes |
| status | Varchar(30) | yes |
| submittedAt | Varchar(40) | yes |

Permissions: applications-এর মতোই private. Public browser access নয়; public form কেবল Function endpoint ব্যবহার করবে.

### account_entries (আর্থিক হিসাব)
| Column | Type | Required |
|---|---|---|
| fund | Varchar(20) | yes |
| entryType | Varchar(20) | yes |
| amount | Float | yes |
| occurredOn | Varchar(10) | yes |
| description | Text | yes |
| reference | Varchar(100) | no |
| createdBy | Varchar(40) | yes |

Permissions: Read/Create/Update/Delete → Admin Team ও Finance role only. Public read নয়.

**Indexes:** `site_content`-এ `moduleId`, `published`, `$createdAt`; `prayer_times`-এ `dateKey`; `applications` ও `volunteers`-এ `referenceCode`, `status`; `account_entries`-এ `fund`, `occurredOn`.

## 3. Team ও roles
একটি Team তৈরি করুন: `Mosque Worldclass Admins`. Roles: `admin`, `editor`, `caseworker`, `finance`. Team-এ শুধু নির্ভরযোগ্য কর্মীদের আমন্ত্রণ দিন। Table/row permissions বাস্তবে Console-এ enforce করুন; শুধু UI লুকানো security নয়।

## 4. Storage
একটি bucket `mosque_worldclass_media` তৈরি করুন। File security ON. Public ছবি/ভিডিওর জন্য আলাদা Read → Any permission; ব্যক্তিগত নথিতে কখনো public permission দেবেন না। Free plan-এ bucket limit/file size Console-এ যাচাই করুন।

## 5. Secure intake Function
`functions/intake` ফোল্ডারের source Appwrite Function-এ upload করুন (Node.js runtime, entrypoint `index.js`, install command `npm install`). Function variables: `DATABASE_ID`, `APPLICATIONS_TABLE_ID`, `VOLUNTEERS_TABLE_ID`, `ADMIN_TEAM_ID`. Function-এর ephemeral API key header `x-appwrite-key` ব্যবহার হবে; প্রয়োজনীয় `rows.write` scope দিন। Runtime থেকে `APPWRITE_FUNCTION_PROJECT_ID` ও `APPWRITE_FUNCTION_API_ENDPOINT` ব্যবহার হবে।

Function execute access: Any, কারণ visitor login ছাড়াই আবেদন জমা দেবেন। Function কেবল নতুন private row তৈরি করবে। Deploy-এর পরে function execution URL `assets/app-config.js`-এ বসান। Public exposure-এর আগে CAPTCHA/abuse protection ও durable rate limit যোগ করে পরীক্ষা করুন। Function code-এর server key কখনো browser-এ দেবেন না।

## 6. Appwrite config
`assets/app-config.js`-এ শুধু public identifiers বসান: endpoint, project ID, database ID, table IDs, bucket ID, admin team ID, intake function URL. API key, password, secret বা service token browser config-এ কখনো রাখবেন না।

## 7. প্রথম Admin ও তথ্য সুরক্ষা
Appwrite Auth-এ admin user তৈরি করুন এবং Team membership invite করে গ্রহণ করুন। এতিম/শিশু ও রোগীর তথ্য public content হিসেবে প্রকাশ করবেন না। নিয়মিত export/backup ও restore drill চালান। আইনগত সম্মতি/গোপনীয়তা নীতি ও তথ্য সংরক্ষণের মেয়াদ নির্ধারণ না করা পর্যন্ত প্রকৃত সংবেদনশীল আবেদন সংগ্রহ করবেন না।
