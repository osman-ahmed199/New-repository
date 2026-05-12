const jwt = require('jsonwebtoken');
const db = require('../database');

// استخراج مفتاح JWT من متغيرات البيئة مع قيمة افتراضية آمنة
const JWT_SECRET = process.env.JWT_SECRET || 'helpdesk-secret-key';

// Middleware للتحقق من توثيق JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'الوصول مرفوض. يرجى تسجيل الدخول.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'الرمز غير صالح.' });
  }
};

// Middleware لتقييد الوصول للمسؤولين فقط
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'الوصول مخصص للمسؤولين فقط.' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
