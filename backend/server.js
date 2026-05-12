// تحميل متغيرات البيئة من ملف .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

const app = express();
// تحديد منفذ الخادم من متغيرات البيئة مع قيمة افتراضية
const PORT = process.env.PORT || 3000;

// Middleware للسماح بالطلبات المتقاطعة ومعالجة JSON
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// تعريف مسارات الـ API
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Debug: طباعة كل الـ routes المسجلة
console.log('🔍 Registered Routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  }
});

// Health check - فحص صحة الخادم
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'نظام الدعم الفني يعمل بشكل صحيح' });
});

// Error handling middleware - معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'حدث خطأ في الخادم.' });
});

// 404 handler - معالجة الصفحات غير الموجودة
app.use((req, res) => {
  res.status(404).json({ error: 'الصفحة غير موجودة.' });
});

// تشغيل الخادم - بدء الاستماع على المنفذ المحدد
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
