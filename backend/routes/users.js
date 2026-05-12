// مسارات إدارة المستخدمين - مخصصة للمديرين فقط
// User Management Routes - Admin Only

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// جلب كل المستخدمين
router.get('/', authMiddleware, adminOnly, (req, res) => {
  try {
    const users = require('../database').prepare(`
      SELECT id, username, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `).all();
    
    res.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب المستخدمين' });
  }
});

// إنشاء مستخدم جديد
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, password, role = 'employee' } = req.body;

    // التحقق من البيانات
    if (!username || !password) {
      return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const db = require('../database');

    // التحقق من وجود المستخدم
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
    }

    // تشفير كلمة المرور
    const passwordHash = bcrypt.hashSync(password, 10);

    // إدخال المستخدم الجديد
    const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
      .run(username, passwordHash, role);

    res.status(201).json({ 
      message: 'تم إنشاء المستخدم بنجاح',
      userId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'حدث خطأ في إنشاء المستخدم' });
  }
});

// حذف مستخدم
router.delete('/:username', authMiddleware, adminOnly, (req, res) => {
  try {
    const { username } = req.params;
    const db = require('../database');

    // منع حذف المدير الرئيسي
    if (username === 'admin') {
      return res.status(400).json({ error: 'لا يمكن حذف المدير الرئيسي' });
    }

    const result = db.prepare('DELETE FROM users WHERE username = ?').run(username);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json({ message: 'تم حذف المستخدم بنجاح' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'حدث خطأ في حذف المستخدم' });
  }
});

// تغيير كلمة مرور مستخدم
router.patch('/:username/password', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const db = require('../database');

    // التحقق من وجود المستخدم
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (!existingUser) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    // تشفير كلمة المرور الجديدة
    const passwordHash = bcrypt.hashSync(password, 10);

    // تحديث كلمة المرور
    const result = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?')
      .run(passwordHash, username);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'حدث خطأ في تغيير كلمة المرور' });
  }
});

// الحصول على إحصائيات المستخدمين
router.get('/stats', authMiddleware, adminOnly, (req, res) => {
  try {
    const db = require('../database');
    
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'employee' THEN 1 END) as employee_count,
        COUNT(CASE WHEN created_at >= date('now', '-30 days') THEN 1 END) as new_users_month
      FROM users
    `).get();

    res.json(stats);
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب إحصائيات المستخدمين' });
  }
});

module.exports = router;
