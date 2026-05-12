# 📋 دليل إدارة المستخدمين - نظام الدعم الفني

## 🔧 الطرق المتاحة لإدارة المستخدمين

### 🖥️ الطريقة 1: سطر الأوامر (CLI)

افتح الـ Terminal في مجلد `backend` واستخدم الأوامر التالية:

#### 📝 إنشاء مستخدم جديد
```bash
# إنشاء موظف جديد
node userManagement.js create ahmed password123 employee

# إنشاء مدير جديد
node userManagement.js create manager adminpass admin
```

#### 📋 عرض كل المستخدمين
```bash
node userManagement.js list
```

#### 🗑️ حذف مستخدم
```bash
node userManagement.js delete ahmed
```

#### 🔐 تغيير كلمة المرور
```bash
node userManagement.js changepass ahmed newpassword123
```

#### 🔄 إنشاء المستخدمين التجريبيين
```bash
node userManagement.js init
```

---

### 🖱️ الطريقة 2: واجهة الإدارة (الموصى بها)

يمكنك إضافة صفحة إدارة المستخدمين في لوحة التحكم:

#### الخطوات:
1. أنشئ مكون `UserManagement.jsx` في frontend
2. أضف route جديد في backend
3. أضف زر "إدارة المستخدمين" في AdminSidebar

---

### 💾 الطريقة 3: مباشرة في قاعدة البيانات

#### 📝 إضافة مستخدم يدوياً:
```sql
-- تشفير كلمة المرور أولاً
-- استخدم bcrypt أو أي أداة تشفير

-- إدخال مستخدم جديد
INSERT INTO users (username, password_hash, role) 
VALUES ('newuser', '$2b$10$encrypted_password_hash', 'employee');
```

#### 📋 عرض المستخدمين:
```sql
SELECT id, username, role, created_at 
FROM users 
ORDER BY created_at DESC;
```

---

## 👥 أنواع المستخدمين

### 🎭 **المدير (Admin)**
- صلاحيات كاملة على النظام
- يمكنه رؤية كل التذاكر
- يمكنه تغيير حالة أي تذكرة
- يمكنه إدارة المستخدمين (إذا تمت إضافة الميزة)

### 👨‍💻 **الموظف (Employee)**
- يرى فقط التذاكر الخاصة به
- يمكنه إنشاء تذاكر جديدة
- يمكنه الرد على التذاكر
- يرى إشعارات عند الرد على تذاكره

---

## 🔐 أفضل الممارسات الأمنية

### 📝 **كلمات المرور القوية**
- على الأقل 8 أحرف
- تحتوي على أحرف كبيرة وصغيرة
- تحتوي على أرقام ورموز
- تجنب المعلومات الشخصية

### 🔄 **تغيير كلمات المرور بانتظام**
- موظفين: كل 90 يوم
- مديرين: كل 60 يوم

### 🚫 **ممنوع**
- مشاركة كلمات المرور
- استخدام كلمات مرور افتراضية في الإنتاج
- كتابة كلمات المرور في أماكن عامة

---

## 📊 أمثلة عملية

### 🏢 **شركة صغيرة (5-10 موظفين)**
```bash
# إنشاء المدير الرئيسي
node userManagement.js create manager company123 admin

# إنشاء الموظفين
node userManagement.js create employee1 emp123 employee
node userManagement.js create employee2 emp123 employee
node userManagement.js create employee3 emp123 employee
```

### 🏢 **شركة متوسطة (10-50 موظف)**
```bash
# إنشاء مديرين متعددين
node userManagement.js create itmanager it123 admin
node userManagement.js create supportmanager sup123 admin

# إنشاء فرق الدعم
node userManagement.js create support1 sup123 employee
node userManagement.js create support2 sup123 employee
node userManagement.js create support3 sup123 employee
```

---

## 🎯 خطوات التشغيل السريع

### 1️⃣ **إعداد النظام**
```bash
cd backend
npm install
node userManagement.js init
npm start
```

### 2️⃣ **تسجيل الدخول الأولي**
- **مدير:** admin / admin123
- **موظف:** employee1 / emp123

### 3️⃣ **إنشاء المستخدمين الحقيقيين**
```bash
# حذف المستخدمين التجريبيين
node userManagement.js delete employee1
node userManagement.js delete employee2
node userManagement.js delete employee3

# إنشاء المستخدمين الحقيقيين
node userManagement.js create ahmed ahmed123 employee
node userManagement.js create sara sara123 employee
```

---

## 🆘 المساعدة

إذا واجهت أي مشاكل:
1. تأكد من تشغيل السيرerver
2. تحقق من صلاحيات الملفات
3. تأكد من وجود ملف `database.db`
4. راجع الـ logs في الـ Console

---

## 📞 الدعم الفني

لأي استفسارات أو مشاكل، راجع:
- ملفات الـ logs في `backend/logs/`
- وثائق الـ API في `/api/health`
- أو تواصل مع فريق التطوير
