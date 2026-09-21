# CRM Demo — All in One

> مرجع واحد پروژه: معماری، قابلیت‌ها، داده‌ها، قواعد محصول، وضعیت فنی و مسیر توسعه.
>
> **آخرین هم‌سنجی با کد:** ۲۱ شهریور ۱۴۰۵  
> **کامیت مبنا:** `14524fb` — `fix: Reports.jsx - total variable undefined`  
> **مخزن:** https://github.com/taharajatiwork-beep/crm-demo  
> **مسیر محلی:** `C:\taha\projects\crm\crm-demo`

---

## 1) پروژه چیست؟

این پروژه یک **دموی کامل CRM فارسی و RTL** برای یک CRM SaaS هوشمند است؛ الهام‌گرفته از نیازهای فروش تیمی و با رویکرد «Anti-Didar».

اصل مرکزی محصول:

> **کاربر باید کمترین کار ممکن را انجام دهد و سیستم با پیشنهاد، دادهٔ پیشنهادی و مسیرهای هوشمند، بیشترین کار را پیش ببرد.**

دمو روی دادهٔ Mock اجرا می‌شود و هنوز Backend، پایگاه داده، API واقعی یا احراز هویت امن ندارد. هدف فعلی، اعتبارسنجی تجربهٔ کاربری، جریان فروش و قواعد هوشمند قبل از پیاده‌سازی محصول واقعی است.

---

## 2) اصول محصول و طراحی

### تصمیم‌های قطعی

1. **Drag & Drop ممنوع است.**
   - انتقال معامله با Smart Gate انجام می‌شود، نه جابه‌جایی آزاد کارت‌ها.
   - برای ارتقا، کاربر به پرسش‌های کوتاه بله/خیر پاسخ می‌دهد؛ انتقال فقط پس از تکمیل شرایط ممکن است.
2. **فرم‌ها نباید کاربر را با صفحهٔ خالی رها کنند.**
   - پیشنهاد شرکت، مخاطب، عنوان معامله، بازهٔ ارزش و تگ خودکار ارائه می‌شود.
3. **Progressive Disclosure.**
   - اطلاعات پیچیده باید در زمان نیاز و با تب، Toggle، Modal یا جزئیات بازشونده نمایش داده شوند.
4. **AI باید اقدامی باشد، نه صرفاً تزئینی.**
   - سلامت معامله، هشدار ریسک، Next Best Action و Rules باید کاربر را به اقدام مشخص هدایت کنند.
5. **همهٔ رابط‌ها فارسی، RTL و responsive هستند.**
6. **رنگ فقط برای معناست.**
   - Accent: اقدام اصلی و انتخاب فعال
   - Success: موفقیت/سلامت مناسب
   - Warning: نیاز به توجه
   - Danger: ریسک یا خطا
   - Info: اطلاعات خنثی

### سطوح دسترسی محصول

| سطح | مفهوم | نمونه |
|---|---|---|
| ۱ | خواندن، آزاد | مشاهدهٔ داشبورد و گزارش‌ها |
| ۲ | کم‌ریسک، قابل اجرای مستقیم | ثبت فعالیت، ساخت پیش‌نویس، افزودن مخاطب |
| ۳ | پرریسک، نیازمند تأیید | حذف، تغییرات سیستمی، ارسال انبوه، عملیات مالی |

> در نسخهٔ دمو، نقش‌ها و permissionها فقط نمایش داده می‌شوند؛ RBAC واقعی هنوز اعمال نشده است.

---

## 3) پشتهٔ فنی

| لایه | فناوری | وضعیت |
|---|---|---|
| UI | React `19.2.8` | فعال |
| Build / Dev Server | Vite `8.3.0` | فعال |
| Styling | Tailwind CSS `4.3.3` از طریق `@tailwindcss/vite` | فعال |
| Iconography | `lucide-react` | فعال |
| Export | `xlsx` | فعال |
| Lint | `oxlint` | اسکریپت تعریف شده |
| Font | Vazirmatn از Google Fonts | فعال، وابسته به شبکه |
| State | React hooks و دادهٔ In-memory | دمو |
| Backend / DB / API | — | هنوز وجود ندارد |

### فرمان‌ها

```bash
cd C:/taha/projects/crm/crm-demo
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

- Vite معمولاً آدرس محلی را در ترمینال نمایش می‌دهد (مثلاً `http://localhost:5173` یا پورتی که آزاد باشد).
- `npm run build` باید پیش از گزارش موفقیت هر تغییر UI یا کد اجرا شود.

---

## 4) ساختار واقعی پروژه

```text
crm-demo/
├── ALL-IN-ONE.md                ← همین فایل؛ مرجع واحد پروژه
├── crm-demo-plan.md             ← قواعد و تصمیم‌های اصلی محصول/توسعه
├── crm-progress.md              ← changelog تغییرات
├── crm-roadmap.md               ← نقشهٔ راه تاریخی
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                 ← React StrictMode entry point
    ├── App.jsx                  ← shell برنامه، auth state، route state، toast، lazy loading
    ├── data.js                  ← همهٔ داده‌ها، مراحل، Smart Gates و helperها
    ├── index.css                ← Tailwind theme، RTL، فونت، scrollbar و animations
    ├── components/
    │   ├── LoginScreen.jsx
    │   ├── Sidebar.jsx
    │   ├── TodayView.jsx
    │   ├── Dashboard.jsx
    │   ├── PipelineBoard.jsx
    │   ├── DealDetail.jsx
    │   ├── DealForm.jsx
    │   ├── ContactForm.jsx
    │   ├── Contacts.jsx
    │   ├── CommandPalette.jsx
    │   ├── QuickAdd.jsx
    │   ├── SmartGateDialog.jsx
    │   ├── CaptureFlow.jsx
    │   ├── CaseWorkflows.jsx
    │   ├── CallLog.jsx
    │   ├── SMSPanel.jsx
    │   ├── Reports.jsx
    │   ├── ExportButton.jsx
    │   ├── SmartRules.jsx
    │   ├── MLInsights.jsx
    │   └── Toast.jsx
    └── ui/
        ├── Badge.jsx
        ├── Button.jsx
        ├── Card.jsx
        ├── DataTable.jsx
        ├── EmptyState.jsx
        ├── ErrorState.jsx
        ├── FilterBar.jsx
        ├── Input.jsx
        ├── LoadingSpinner.jsx
        ├── Modal.jsx
        ├── PageLoader.jsx
        ├── SearchInput.jsx
        ├── Select.jsx
        ├── Skeleton.jsx
        └── index.js
```

### حجم فعلی کد

- `12,012` خط در فایل‌های `src` با پسوند JSX/JS/CSS
- 22 کامپوننت در `src/components`
- 14 primitive/reusable component در `src/ui`
- صفحات اصلی با `React.lazy` به chunk جداگانه تقسیم می‌شوند.

---

## 5) معماری اجرا و جریان داده

### `main.jsx`

برنامه را با `createRoot` و `StrictMode` اجرا می‌کند و `index.css` را بارگذاری می‌کند.

### `App.jsx`

هستهٔ orchestration دمو است:

- نگهداری کاربر واردشده در `currentUser`
- نگهداری مسیر فعال در `activePage`
- نگهداری معاملهٔ انتخاب‌شده در `selectedDeal`
- مدیریت Toastها، Quick Add، Command Palette و Capture Flow
- نمایش `LoginScreen` تا قبل از ورود
- Lazy-load کردن تمام صفحات سنگین
- شبیه‌سازی loading ۳۰۰ میلی‌ثانیه‌ای هنگام تغییر صفحه
- Shortcutها:
  - `Ctrl/Cmd + K`: Command Palette
  - `Ctrl/Cmd + Shift + K`: Quick Add
  - `Ctrl/Cmd + Shift + C`: Capture Flow

### مدل مسیریابی فعلی

Router خارجی وجود ندارد. مسیرها با state داخلی `activePage` انتخاب می‌شوند:

| کلید مسیر | صفحه |
|---|---|
| `today` | TodayView |
| `dashboard` | Dashboard |
| `pipeline` | PipelineBoard |
| `contacts` | Contacts |
| `workflows` | CaseWorkflows |
| `reports` | Reports |
| `callLog` | CallLog |
| `sms` | SMSPanel |
| `smartRules` | SmartRules |
| `deal` | DealDetail |

### محدودیت مهم state

بخش‌هایی مانند Pipeline و Contacts state محلی خود را دارند. بنابراین دادهٔ ثبت‌شده در یک فرم لزوماً به تمام صفحات یا پس از refresh منتقل نمی‌شود. این رفتار برای دمو قابل قبول است، اما برای نسخهٔ واقعی باید به store/API واحد منتقل شود.

---

## 6) داده‌های Mock

تمام داده‌ها در `src/data.js` هستند.

### داده‌های اصلی

| نوع | مقدار فعلی |
|---|---:|
| معاملات | ۱۲ |
| مخاطبان | ۸ |
| فعالیت‌ها | ۱۰ |
| AI Insightهای پایه | ۵ |
| قالب پیامک | ۶ |
| تاریخچه پیامک | ۸ |
| پرونده‌های پیگیری | ۸ |
| پرونده‌های قرارداد | ۶ |

### مراحل فروش

| شناسه | عنوان فارسی | احتمال پیش‌فرض |
|---|---|---:|
| `lead` | سرنخ | ۱۰٪ |
| `qualified` | تأیید شده | ۲۵٪ |
| `discovery` | کشف نیاز | ۴۰٪ |
| `proposal` | پیشنهاد | ۵۵٪ |
| `negotiation` | مذاکره | ۷۰٪ |
| `won` | برنده | ۱۰۰٪ |

هر معامله شامل عنوان، شرکت، مخاطب، ارزش، مرحله، سلامت، احتمال، روزهای حضور در مرحله، فعالیت آخر، اقدام بعدی، مالک و تگ‌هاست.

### Helperهای داده

- `formatCurrency(value)` — نمایش مبلغ با locale فارسی و تومان
- `getHealthColor(health)` — `success` / `warning` / `danger`
- `getHealthBg(health)` — پس‌زمینه و border متناسب با سلامت
- `stages`, `smartGates`, `stageProbabilities`
- `followUpStages`, `contractStages`, `followUpGates`, `contractGates`

---

## 7) صفحات و قابلیت‌ها

### 7.1 ورود (`LoginScreen.jsx`)

- ورود ایمیل/رمز عبور برای دمو
- نمایش/مخفی‌سازی رمز
- سه حساب آماده با انتخاب یک‌کلیکی
- گزینهٔ «مرا به خاطر بسپار» با `localStorage`
- نقش‌ها: مدیر عامل، مدیر فروش، فروشنده
- error state و animation لرزش

#### حساب‌های نمونه

| نقش | ایمیل | رمز |
|---|---|---|
| مدیر عامل | `admin@crm-demo.ir` | `admin123` |
| مدیر فروش | `manager@crm-demo.ir` | `manager123` |
| فروشنده | `ali@crm-demo.ir` | `ali123` |

> این اطلاعات فقط برای Demo هستند. این روش **امن نیست** و نباید در نسخهٔ production باقی بماند.

### 7.2 Sidebar (`Sidebar.jsx`)

- ناوبری دسکتاپ و منوی hamburger در موبایل
- جستجوی سریع با میانبر ⌘K/Ctrl+K
- CTA ثبت تماس که `capture-flow-open` dispatch می‌کند
- نمایش کاربر و نقش جاری
- خروج از حساب و پاک‌کردن کاربر remembered
- Badge دستیار هوشمند در دسکتاپ

### 7.3 صفحهٔ امروز (`TodayView.jsx`)

Dashboard روزانهٔ فروشنده:

- KPIهای معاملات فعال، ارزش Pipeline، ارزش در خطر و سلامت متوسط
- «تمرکز امروز» با رتبه‌بندی urgency
- AI Daily Briefing برای معاملات متوقف، در خطر و آماده بستن
- ML Insights
- آخرین فعالیت‌ها
- برنامهٔ روز
- quick actions
- modal ساخت معامله از طریق `DealForm`

### 7.4 داشبورد (`Dashboard.jsx`)

- جستجو در معامله، شرکت و مخاطب
- فیلتر مالک و سلامت
- کارت‌های هشدار: خطر، پیگیری عقب‌افتاده، بدون تماس، احتمال بالا
- Next Best Actions پایه از `aiInsights`
- خلاصه Pipeline در تمام مراحل
- آمار سریع، برنامهٔ روز و معاملات با احتمال بالا
- loading و empty stateهای موضعی

### 7.5 تخته معاملات (`PipelineBoard.jsx`)

- دو حالت نمایش: Kanban و List
- فیلترهای جستجو، مرحله، مالک و سلامت
- تگ‌های فیلتر فعال و پاک‌سازی آن‌ها
- رفتار responsive با scroll افقی Kanban در موبایل
- ساخت معامله با `DealForm`
- انتقال مرحله با `SmartGateDialog`
- افزایش احتمال مرحله، reset روزهای مرحله و بهبود سلامت بعد از انتقال موفق
- هیچ Drag & Drop در این صفحه وجود ندارد.

### 7.6 جزئیات معامله (`DealDetail.jsx`)

- سربرگ معامله و شاخص سلامت
- نوار پیشرفت فروش
- تگ‌ها، اطلاعات معامله و کارت مخاطب
- Timeline فعالیت‌ها
- ثبت سریع تماس، ایمیل، جلسه، یادداشت یا تسک
- تحلیل، پیش‌بینی و اقدام پیشنهادی AI
- Smart Gate داخلی برای انتقال به مرحلهٔ بعد

### 7.7 مشتریان (`Contacts.jsx`)

- جستجو در نام، شرکت، ایمیل، نقش و تلفن
- فیلتر وضعیت همه/فعال/اخیر
- فیلتر شرکت
- جدول داده با sorting
- نمای موبایل مبتنی بر کارت
- ساخت مخاطب با `ContactForm`
- دسترسی سریع به تماس، ایمیل و معاملهٔ مرتبط
- استفاده از null-safe access برای ردیف‌های جدول (`row?.property`)

### 7.8 ثبت سریع (`QuickAdd.jsx`)

- باز شدن با `Ctrl/Cmd + Shift + K` یا دکمهٔ شناور
- دو mode: معامله و مخاطب
- پیشنهاد شرکت بر اساس داده‌های فعلی
- پیشنهاد عنوان قرارداد و مخاطب
- انتخاب بازهٔ ارزش و برچسب خودکار کوچک/متوسط/بزرگ
- ثبت سریع با Enter و خروج با Escape

### 7.9 جستجوی سراسری (`CommandPalette.jsx`)

- باز/بسته شدن با `Ctrl/Cmd + K`
- جستجو در صفحه‌ها، معاملات و مشتریان
- کنترل با ↑/↓، Enter و Escape
- highlight عبارت جستجو

### 7.10 Capture Flow (`CaptureFlow.jsx`)

جریان پس از تماس برای ثبت ساختارمند مکالمه. این کامپوننت یک flow پنج‌مرحله‌ای دارد و از Sidebar یا shortcut باز می‌شود.

### 7.11 گردش پرونده‌ها (`CaseWorkflows.jsx`)

دو مدل پروندهٔ عملیاتی:

- پیگیری مشتری
- پیگیری قرارداد

برای هرکدام مراحل، اولویت، موعد، مالک، اطلاعات ارتباط و Smart Gateهای انتقال وجود دارد.

### 7.12 تماس‌ها (`CallLog.jsx`)

- ثبت و مشاهدهٔ تماس‌ها
- عملیات click-to-call برای تجربهٔ دمو
- اتصال مفهومی تماس به مخاطب/معامله

### 7.13 پیامک (`SMSPanel.jsx`)

- قالب‌های آمادهٔ پیامک
- متغیرهای قالب مانند نام و شرکت
- تاریخچهٔ وضعیت ارسال
- رفتار دموی ارسال؛ اتصال واقعی SMS provider هنوز پیاده‌سازی نشده است.

### 7.14 گزارش‌ها (`Reports.jsx`) و خروجی (`ExportButton.jsx`)

- گزارش شخصی و تیمی
- KPI و تحلیل دادهٔ معامله
- خروجی اکسل با `xlsx`
- آخرین خطای شناخته‌شدهٔ این بخش (`total is not defined`) در کامیت `14524fb` با جایگزینی `all.length` اصلاح شد.

### 7.15 قوانین هوشمند (`SmartRules.jsx`)

موتور Rule-based AI دمو با سه تب:

1. امتیاز سلامت
2. قوانین فعال
3. پیشنهادات

#### ۸ قانون فعلی

1. معامله متوقف بیش از ۱۰ روز
2. سلامت کمتر از ۴۰٪
3. معامله با ارزش بالا و آماده بستن
4. عدم فعالیت بیش از ۷ روز
5. سرنخ جدید
6. معاملهٔ بزرگ در خطر
7. پیگیری ضروری در پیشنهاد/مذاکره
8. آماده بودن برای پیشرفت مرحله

#### Health Score

وزن‌دهی فعلی:

| عامل | وزن |
|---|---:|
| پیشرفت مرحله | ۲۵٪ |
| تازگی فعالیت | ۲۵٪ |
| احتمال بسته‌شدن | ۲۰٪ |
| ریسک ارزش | ۱۵٪ |
| تعامل مخاطب | ۱۵٪ |

#### Next Best Action

برای هر معامله ممکن است تماس فوری، جلسه، بستن قرارداد، ایمیل پیگیری، ارزیابی سرنخ، escalation یا پیگیری عادی پیشنهاد شود.

### 7.16 ML Insights (`MLInsights.jsx`)

تحلیل‌های نمایشی بر پایهٔ دادهٔ Mock از جمله احتمال برد، ریسک churn، forecast درآمد و الگوی فعالیت. مدل ML یا سرویس AI واقعی متصل نیست.

---

## 8) Smart Gates

Smart Gate جایگزین Drag & Drop است.

### جریان اصلی فروش

| انتقال | نمونهٔ شرط |
|---|---|
| سرنخ → تأیید شده | تماس با مخاطب، تکمیل اطلاعات، مشخص شدن نیاز اولیه |
| تأیید شده → کشف نیاز | برگزاری جلسه معرفی و تأیید علاقه‌مندی |
| کشف نیاز → پیشنهاد | شناسایی نیاز، تأیید بودجه، حداقل ۳ فعالیت |
| پیشنهاد → مذاکره | ارسال پیشنهاد و دریافت بازخورد |
| مذاکره → برنده | توافق نهایی و امضای قرارداد |

### رفتار UI

- هر سؤال پاسخ بله/خیر دارد.
- انتقال تا تأیید همهٔ شروط disabled است.
- بعد از انتقال، معامله در state محلی Pipeline به مرحلهٔ بعد می‌رود.
- Smart Gateهای جدا برای پیگیری مشتری و قرارداد نیز در `data.js` وجود دارند.

---

## 9) Design System فعلی (`src/ui`)

| کامپوننت | مسئولیت |
|---|---|
| `Button` | primary / secondary / danger / ghost، loading و sizeها |
| `Card` | wrapper استاندارد کارت، Header، Title و Content |
| `Badge` | وضعیت‌های success/warning/danger/info/neutral |
| `Modal` | dialog قابل دسترس با Escape و focus trap |
| `Input` | label، icon، validation error و helper text |
| `Select` | انتخاب custom با click-outside |
| `SearchInput` | input جستجو با clear |
| `FilterBar` | فیلتر و chipهای فعال |
| `DataTable` | sorting و empty/loading state |
| `EmptyState` | حالت بدون داده با CTA |
| `ErrorState` | حالت خطا و retry |
| `LoadingSpinner` | loading معمولی یا overlay |
| `PageLoader` | loading تغییر صفحه |
| `Skeleton` | primitiveهای loading skeleton |

### وضعیت مهم DataTable

پیاده‌سازی فعلی `DataTable` sorting دارد. پارامترهای قدیمی یا ناهم‌خوان مانند `pageSize`، `rowKey`، `mobileRender` و گزینه‌های پیشرفته در call site برخی صفحه‌ها ممکن است وجود داشته باشند، اما در implementation فعلی API کامل صفحه‌بندی/mobile renderer دیده نمی‌شود. قبل از اتکا به این APIها در توسعهٔ بعدی باید آن‌ها هم‌راستا و تست شوند.

---

## 10) سیستم استایل فعلی

### توکن‌های Tailwind

در `src/index.css` تعریف شده‌اند:

- `dark-900` تا `dark-100`
- `accent`, `accent-light`, `accent-dark`
- `success`, `warning`, `danger`, `info`

### مشخصات

- پس‌زمینهٔ اصلی: `#0f0f14`
- حالت فعلی: Dark-first
- `body` دارای `direction: rtl`
- فونت: Vazirmatn با fallback `Segoe UI`, `system-ui`
- scrollbar سفارشی
- animationهای `slide-in-right`، `shimmer` و `fade-in`

### ریسک‌های طراحی شناخته‌شده

پیش از هر بازطراحی گسترده، باید این موارد به‌صورت مرحله‌ای اصلاح شوند:

1. رنگ‌های hard-coded `dark-*` در صفحات و UI primitives فراوان‌اند؛ Light Mode واقعی در وضعیت فعلی وجود ندارد.
2. تعداد استفاده‌های هم‌زمان از accent/success/warning/danger/info در برخی صفحه‌ها زیاد است و سلسله‌مراتب بصری را شلوغ می‌کند.
3. borderهای زیاد روی cardها، filterها و modalها ممکن است ظاهر را سنگین کنند.
4. dropdown پیشنهاد شرکت در Quick Add هنگام باز شدن modal به‌طور پیش‌فرض باز است (`showCompanySuggestions=true`)؛ این با تجربهٔ «افشای تدریجی» سازگار نیست و باید در یک قدم مجزا اصلاح شود.
5. تغییرات ظاهری باید با screenshot/reference و بررسی Dark/Light، modal، table، card و workflow انجام شود؛ نه replace سراسری کلاس‌ها.

---

## 11) وضعیت احراز هویت و مجوز

### آنچه وجود دارد

- سه کاربر Demo
- role و permission array نمایشی
- remember me با localStorage
- logout

### آنچه وجود ندارد

- Backend login
- هش رمز
- JWT/session امن
- refresh token
- route guard واقعی
- RBAC enforcement
- audit trail
- multi-tenant isolation

**قاعده:** دادهٔ حساب‌های Demo هرگز نباید به نسخهٔ واقعی منتقل شود.

---

## 12) کیفیت، تست و قواعد توسعه

### قواعد اجباری

1. قبل از هر کار، `crm-demo-plan.md` را بخوانید.
2. هر تغییر کوچک یک commit مستقل داشته باشد.
3. بعد از هر تغییر: build، commit، push و به‌روزرسانی `crm-progress.md`.
4. دادهٔ Demo را production فرض نکنید.
5. برای همهٔ دسترسی‌های احتمالی undefined/null از الگوی امن استفاده شود:

```jsx
const lastContact = String(row?.lastContact || value || '');
const match = (row?.name || '').includes(query);
```

6. React key باید unique و پایدار باشد؛ از کلیدهای تکراری مانند `type` در map استفاده نشود.
7. هیچ Drag & Drop اضافه نشود.
8. برای تغییرهای UI، ابتدا یک محدودهٔ کوچک انتخاب، screenshot یا browser test، سپس commit شود.

### حداقل verification

```bash
npm run build
npm run lint
```

همچنین در مرور مرورگر بررسی شود:

- console بدون error/warning React key
- باز/بسته‌شدن modalها
- dropdownها و click-outside
- مسیرهای اصلی sidebar
- ایجاد معامله/مخاطب و toast
- فیلترها و empty state
- Smart Gate و disabled state
- desktop و mobile

---

## 13) وضعیت Git

- Branch هدف: `main`
- Remote: `https://github.com/taharajatiwork-beep/crm-demo.git`
- کامیت مبنای این سند: `14524fb`
- کامیت تاریخی پایدار قبل از آزمایش‌های بازطراحی: `e2ff883c5c1b8cd7fb378225ac95c95e1dcd3293`

### هشدار دربارهٔ force push

اگر reset به یک commit قدیمی انجام شده باشد، push معمولی ممکن است rejected شود. Force push فقط پس از اطمینان از اینکه بازنویسی تاریخچهٔ remote عمدی است باید استفاده شود.

---

## 14) قابلیت‌های انجام‌شده در برابر قابلیت‌های محصول واقعی

| حوزه | دمو | محصول واقعی لازم دارد |
|---|---|---|
| معاملات و Pipeline | UI و state محلی | API، persistence، history، permissions |
| مشتریان | جدول و فرم Mock | CRUD واقعی، dedupe، import/export معتبر |
| AI | Rule-based و متن نمایشی | مدل/LLM، data pipeline، explainability، feedback loop |
| SMS/Call | UI demo | provider integration، delivery tracking، consent |
| گزارش | محاسبهٔ روی Mock و xlsx | query layer، report permissions، scheduled exports |
| Auth | حساب ثابت در client | backend auth، hash، session/JWT، RBAC |
| Workflow | gateهای نمایشی | workflow engine، SLA، audit log، automation |
| Multi-tenancy | ندارد | tenant isolation، RLS، billing |

---

## 15) اولویت‌های پیشنهادی بعدی

### مسیر A — تثبیت UI (اولویت فعلی)

تغییرها باید کوچک، قابل مشاهده و قابل rollback باشند:

1. **مرحله ۱: Quick Add و Modalها**
   - dropdown پیشنهادها فقط بعد از focus یا تایپ باز شود.
   - یک الگوی واحد برای backdrop، panel، input و actionها تعیین شود.
   - contrast متن در dark mode بررسی شود.
2. **مرحله ۲: Card و Border system**
   - سطح‌های surface را به حداکثر ۲ یا ۳ سطح کاهش دهید.
   - border صرفاً برای grouped controls یا selected state باشد.
   - cardهای معمولی با background/spacing از canvas جدا شوند، نه border سنگین.
3. **مرحله ۳: رنگ‌ها و hierarchy**
   - Accent فقط برای CTA اصلی/active state.
   - رنگ وضعیت فقط کنار آیتمِ مرتبط، نه برای همهٔ containerها.
   - info/warning/success/danger از رنگ پس‌زمینهٔ بزرگ به icon/badge کوچک‌تر منتقل شوند.
4. **مرحله ۴: Light Mode واقعی**
   - اول tokenهای semantic (`surface`, `text`, `border`, `muted`) بسازید.
   - سپس یک صفحه در هر commit migrate شود.
   - workflow، table و modal باید هم در dark و هم light screenshot-test شوند.
5. **مرحله ۵: صفحات پرجزئیات**
   - TodayView، Dashboard، Pipeline و CaseWorkflows را بر پایهٔ design reference اصلاح کنید.

### مسیر B — یکپارچگی داده

- ایجاد store واحد برای deals, contacts, activities
- persistence محلی موقت یا API واقعی
- نمایش دادهٔ جدید در همهٔ صفحات
- حذف sourceهای state جداگانه

### مسیر C — Backend MVP

- API با OpenAPI
- PostgreSQL
- JWT/session امن
- RBAC سه‌سطحی
- audit log
- multi-tenant model

### مسیر D — AI قابل اتکا

- ثبت رخداد واقعی فعالیت‌ها
- feature store سلامت معامله
- recommendation با دلیل قابل نمایش
- امکان dismiss/feedback روی پیشنهادها
- سنجش دقت و اثر بر conversion

---

## 16) چک‌لیست قبل از انتشار Demo

- [ ] `npm run build` موفق
- [ ] `npm run lint` بررسی شده
- [ ] هیچ React duplicate key warning وجود ندارد
- [ ] هیچ `undefined` یا `includes/name` error در console وجود ندارد
- [ ] Login هر سه حساب Demo کار می‌کند
- [ ] Sidebar، ⌘K و Quick Add تست شده‌اند
- [ ] Smart Gate انتقال نادرست را مسدود می‌کند
- [ ] Report page بدون `total is not defined` اجرا می‌شود
- [ ] Dark Mode در همهٔ صفحات قابل خواندن است
- [ ] اگر Light Mode اضافه شد، متن سفید روی surface روشن وجود ندارد
- [ ] mobile layout در صفحات اصلی تست شده
- [ ] README جایگزین یا به این سند ارجاع داده شده است

---

## 17) منابع داخلی مستندات

| فایل | نقش |
|---|---|
| `ALL-IN-ONE.md` | مرجع جامع و وضعیت فعلی کد |
| `crm-demo-plan.md` | قوانین اصلی محصول و توسعه |
| `crm-progress.md` | تاریخچهٔ تغییرات و کامیت‌ها |
| `crm-roadmap.md` | تاریخچهٔ فازها و اهداف انجام‌شده |
| `README.md` | هنوز README پیش‌فرض Vite است و باید به راهنمای کوتاه پروژه تبدیل شود |

---

## جمع‌بندی

CRM Demo اکنون یک prototype نسبتاً کامل در لایهٔ Frontend است: ورود نقش‌محور، dashboard روزانه، pipeline بدون drag & drop، Smart Gate، مشتریان، تماس، SMS، workflow پرونده، گزارش، export، AI rule engine، command palette و formهای پیشنهادی را دارد.

اما این پروژه هنوز یک **دمو با دادهٔ Mock و state محلی** است. اولویت نزدیک، تثبیت تدریجی کیفیت UI و رنگ/کنتراست است؛ سپس یکپارچه‌سازی state و Backend واقعی.
