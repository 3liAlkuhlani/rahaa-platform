# منصة راحة للنقل والتوصيل (Rahaa Platform) 🚗📦

منصة متكاملة ومتطورة لخدمات النقل الذكي، تأجير السيارات، نقل البضائع والشاحنات، وتوصيل الطرود بالدراجات النارية في اليمن والوطن العربي.

---

## 🏗️ هيكلية المشروع (Monorepo Architecture)

```
rahaa-platform/
├── rahaa-admin/        # الواجهة الأمامية للويب (React 18 + Vite + TailwindCSS)
├── rahaa-api/          # الواجهة الخلفية وقواعد البيانات (Laravel 12 REST API + Sanctum)
└── rahaa/              # تطبيق الهاتف الذكي (Flutter Mobile App)
```

---

## 🌟 الخدمات المدعومة في المنصة

1. **خدمة تاكسي راحة (Taxi):** حجز مشاوير فورية مع تتبع مباشر وتحديد تسعيرة عادلة.
2. **شاحنات النقل (Trucks Cargo):** نقل البضائع، الأثاث، والمعدات مع تحديد نوع الشاحنة والوزن بالأطنان.
3. **تأجير السيارات (Car Rentals):** حجز واستئجار سيارات مع نظام ضمانات نقدية وعينية وعقود رقمية.
4. **دراجات التوصيل (Motorcycles):** توصيل الطرود والطلبات السريعة داخل المدن.

---

## 🚀 التشغيل المحلي (Local Development)

### 1. تشغيل الواجهة الخلفية (Backend)
```bash
cd rahaa-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed --class=MultiTransportSeeder
php artisan serve --port=8000
```

### 2. تشغيل الواجهة الأمامية (Frontend)
```bash
cd rahaa-admin
npm install
npm run dev
```

---

## 🌐 النشر والاستضافة المجانية (Cloud Deployment)

### الواجهة الأمامية على Vercel:
- **Root Directory:** `rahaa-admin`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api`

### الواجهة الخلفية على Render / Koyeb:
- **Root Directory:** `rahaa-api`
- **Environment:** `Docker` (باستخدام `rahaa-api/Dockerfile`)
- **Port:** `8000`
