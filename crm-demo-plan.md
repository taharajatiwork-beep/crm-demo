# CRM Demo — قوانین و پلن اصلی

> ⚠️ **این فایل را قبل از هر کاری بخوانید.** منبع حقیقت پروژه است.

## اطلاعات پروژه

| فیلد | مقدار |
|---|---|
| **مسیر** | `C:\taha\projects\crm\crm-demo` |
| **GitHub** | https://github.com/taharajatiwork-beep/crm-demo.git |
| **Tech Stack** | React 18 + Tailwind CSS + Vite |
| **فونت** | Vazirmatn (فارسی) |
| **تم** | Dark Mode — RTL راست‌چین فارسی |
| **داده** | Mock (JSON) — فعلاً بدون Backend |

---

## فلسفه طراحی — Anti-Didar

> **کاربر کمترین کار ممکن رو بکنه، سیستم بیشتر کارها رو انجام بده.**

1. **Drag & Drop نداریم** — جا‌به‌جایی هوشمند با Smart Gates
2. **Smart Gates** — سوالات ساده بله/خیر → سیستم خودش ارتقا میده
3. **Progressive Disclosure** — اطلاعات پیشرفته پشت toggle
4. **Contextual Help** — راهنما در لحظه، نه ویدیو جداگانه
5. **AI Copilot** — Next Best Actions، Health Score، Forecasting
6. **نقش‌محور** — هر نقش داشبورد شخصی خودش رو داره

---

## قوانین توسعه (از cursor.md)

1. **هر قدم = یک کامیت** — checkpoint بعد از هر تغییر کوچک
2. **اطلاعات در فایل** — نه در حافظه LLM (این فایل و crm-progress.md)
3. **تست روی دیتابیس فیک** — هرگز production
4. **۳ سطح دسترسی:**
   - سطح ۱: خواندن (آزاد)
   - سطح ۲: کم‌ریسک (خودش انجام میده)
   - سطح ۳: پرریسک (اجازه بگیر)
5. **صداقت** — اگه اشتباه بوده قبول کن، الکی خوب نشون نده
6. **Context کامل** — جزییات بده، نه مبهم
7. **بعد از هر آپدیت: کامیت + پوش + آپدیت crm-progress.md**

---

## ساختار پروژه

```
src/
├── main.jsx                    → Entry point
├── App.jsx                     → Router + Toast state
├── index.css                   → Tailwind + Dark theme
├── data.js                     → Mock data + Smart Gates
└── components/
    ├── Sidebar.jsx             → نوار کناری + موبایل
    ├── Dashboard.jsx           → داشبورد نقش‌محور
    ├── PipelineBoard.jsx       → تخته معاملات (Kanban + List)
    ├── Contacts.jsx            → لیست مشتریان
    ├── DealDetail.jsx          → جزئیات معامله + Timeline
    ├── SmartGateDialog.jsx     → دیالوگ سوالات هوشمند
    ├── DealForm.jsx            → فرم ایجاد معامله
    ├── ContactForm.jsx         → فرم ایجاد مشتری
    └── Toast.jsx               → سیستم نوتیفیکیشن
```

---

## صفحات و قابلیت‌ها

### ✅ داشبورد (Dashboard)
- کارت‌های هشدار (معامله در خطر، پیگیری عقب‌افتاده، بدون تماس، احتمال بالا)
- اقدامات بعدی هوشمند (AI-generated)
- خلاصه Pipeline با نمودار
- آمار سریع (ارزش کل، فروش، نرخ تبدیل)
- برنامه امروز

### ✅ تخته معاملات (Pipeline)
- ۶ ستون: سرنخ → تایید شده → کشف نیاز → پیشنهاد → مذاکره → برنده
- نمایش ستونی (Kanban) + نمایش لیستی
- **Smart Gates**: دکمه «رفتن به مرحله بعد» → دیالوگ سوالات
- Health Score روی هر کارت

### ✅ مشتریان (Contacts)
- جدول با جستجو و فیلتر (همه/فعال/اخیر)
- فرم ایجاد مشتری جدید (Modal)
- دکمه‌های تماس/ایمیل/مشاهده معامله

### ✅ جزئیات معامله (Deal Detail)
- نوار پیشرفت مراحل
- تایم‌لاین فعالیت‌ها
- Smart Gates inline (پیشرفت شرایط)
- ثبت فعالیت سریع (تماس/ایمیل/جلسه/یادداشت/تسک)
- بینش‌های AI
- اطلاعات تکمیلی + کارت مخاطب

### ✅ Smart Gates
- سوالات بله/خیر برای هر مرحله انتقال
- نمایش پیشرفت (۲ از ۳ شرط)
- دکمه انتقال فقط وقتی همه شرایط برآورده

### ✅ سیستم‌های کمکی
- Toast notifications
- Responsive layout (موبایل + دسکتاپ)
- Sidebar موبایل (hamburger menu)

---

## مرحله بعدی — Phase 1 تکمیل

- [ ] فرم ایجاد معامله جدید (کامل با فیلدها)
- [ ] Responsive design کامل (تمام صفحات)
- [ ] Loading states و skeleton
- [ ] Keyboard shortcuts (Cmd+K)
- [ ] Empty states راهنما
- [ ] Tooltip راهنما روی فیلدها

## Phase 2 — Backend
- [ ] Node.js + Express/FastAPI
- [ ] PostgreSQL + Redis
- [ ] JWT Auth + OAuth
- [ ] REST API + OpenAPI

## Phase 3 — AI Intelligence
- [ ] Deal Health Score Engine
- [ ] Next Best Action (NBA)
- [ ] Smart Automation Rules
- [ ] Forecasting

## Phase 4 — Multi-Tenant SaaS
- [ ] Row-level isolation
- [ ] RBAC
- [ ] Rate Limiting

## Phase 5 — ایرانی‌سازی
- [ ] تقویم شمسی
- [ ] SMS (KavehNegar)
- [ ] درگاه پرداخت (ZarinPal)
- [ ] اعداد فارسی

## Phase 6 — Deploy
- [ ] Docker + CI/CD
- [ ] Monitoring + Sentry
- [ ] Security audit

## Phase 7 — Beta Launch
- [ ] Onboarding wizard
- [ ] Pricing/Billing
- [ ] Feedback loop
