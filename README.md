# نظام الدعم الفني - Helpdesk System

نظام دعم فني كامل للشركات الصغيرة، مبني باللغة العربية مع دعم كامل للـ RTL.

## التقنيات المستخدمة

### Frontend
- React 18
- Vite
- TailwindCSS (مع دعم RTL)
- React Router
- Axios

### Backend
- Node.js
- Express
- SQLite (better-sqlite3)
- JWT Authentication
- bcryptjs

## هيكل المشروع

```
Helpdesk/
├── frontend/          # React App
│   ├── src/
│   │   ├── components/ # مكونات قابلة لإعادة الاستخدام
│   │   ├── contexts/   # React Context (Auth)
│   │   ├── pages/      # الصفحات الرئيسية
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/           # Express API
│   ├── routes/        # API Routes
│   ├── middleware/    # Middleware
│   ├── database.js    # SQLite Setup
│   ├── server.js      # Main Server File
│   └── package.json
└── README.md
```

## التثبيت والتشغيل

### 1. تثبيت الاعتماديات

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. تشغيل الخادم

```bash
# في مجلد backend
npm start
# أو للتطوير
npm run dev
```

الخادم سيعمل على `http://localhost:3000`

### 3. تشغيل الواجهة الأمامية

```bash
# في مجلد frontend
npm run dev
```

الواجهة الأمامية ستعمل على `http://localhost:5173`

## حسابات تجريبية

### مسؤول
- **اسم المستخدم:** admin
- **كلمة المرور:** admin123

### موظفين
- **اسم المستخدم:** employee1
- **كلمة المرور:** emp123

- **اسم المستخدم:** employee2
- **كلمة المرور:** emp123

- **اسم المستخدم:** employee3
- **كلمة المرور:** emp123

## المميزات

### للموظفين
- إنشاء تذاكر جديدة
- عرض تذاكرهم الخاصة
- متابعة حالة التذاكر
- قراءة ردود المسؤولين
- نظام إشعارات

### للمسؤولين
- لوحة تحكم بإحصائيات كاملة
- عرض جميع التذاكر
- فلترة التذاكر بالحالة والأولوية
- تغيير حالة التذاكر
- الرد على التذاكر
- نظام إشعارات تلقائي

### مميزات فنية
- **RTL كامل:** دعم كامل للغة العربية واتجاه RTL
- **Responsive:** يعمل على جميع أحجام الشاشات
- **آمن:** JWT authentication + bcrypt للكلمات السرية
- **سريع:** SQLite + better-sqlite3
- **حديث:** React 18 + Vite

## قاعدة البيانات

الجداول المستخدمة:
- `users`: المستخدمين (موظفين ومسؤولين)
- `tickets`: التذاكر
- `replies`: الردود على التذاكر
- `notifications`: الإشعارات

## API Endpoints

### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - بيانات المستخدم الحالي

### Tickets
- `POST /api/tickets` - إنشاء تذكرة جديدة (موظفين فقط)
- `GET /api/tickets/my` - تذاكر الموظف الحالي
- `GET /api/tickets/:id` - تفاصيل تذكرة

### Admin
- `GET /api/admin/tickets` - كل التذاكر مع فلترة
- `PATCH /api/admin/tickets/:id/status` - تغيير حالة التذكرة
- `POST /api/admin/tickets/:id/reply` - الرد على تذكرة
- `GET /api/admin/dashboard` - إحصائيات اللوحة
- `GET /api/admin/notifications` - الإشعارات
- `PATCH /api/admin/notifications/:id/read` - تحديد الإشعار كمقروء

## تطوير

### إضافة متغيرات البيئة
إنشاء ملف `.env` في مجلد `backend`:

```
JWT_SECRET=your-secret-key-here
PORT=3000
```

### تعديل الستايل
الستايل يستخدم TailwindCSS مع دعم RTL. يمكن تعديل الألوان والتصميم من `frontend/src/index.css`.

## المساهمة

1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## الرخصة

MIT License
