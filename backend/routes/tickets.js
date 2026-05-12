const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Create new ticket (employees only)
router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ error: 'فقط الموظفون يمكنهم إنشاء تذاكر.' });
  }

  const { title, description, priority } = req.body;

  if (!title || !description || !priority) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
  }

  if (!['high', 'medium', 'low'].includes(priority)) {
    return res.status(400).json({ error: 'الأولوية غير صالحة.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO tickets (user_id, title, description, priority)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, title, description, priority);

    res.status(201).json({
      id: result.lastInsertRowid,
      message: 'تم إنشاء التذكرة بنجاح.'
    });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء التذكرة.' });
  }
});

// Get current user's tickets
router.get('/my', authMiddleware, (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ error: 'هذه الصفحة للموظفين فقط.' });
  }

  try {
    const tickets = db.prepare(`
      SELECT t.*, u.username
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `).all(req.user.id);

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب التذاكر.' });
  }
});

// Get ticket details (employee can only see their own, admin can see all)
router.get('/:id', authMiddleware, (req, res) => {
  const ticketId = req.params.id;

  try {
    let ticket;
    
    if (req.user.role === 'admin') {
      ticket = db.prepare(`
        SELECT t.*, u.username as created_by
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = ?
      `).get(ticketId);
    } else {
      ticket = db.prepare(`
        SELECT t.*, u.username as created_by
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = ? AND t.user_id = ?
      `).get(ticketId, req.user.id);
    }

    if (!ticket) {
      return res.status(404).json({ error: 'التذكرة غير موجودة.' });
    }

    // Get replies
    const replies = db.prepare(`
      SELECT r.*, u.username as admin_name
      FROM replies r
      JOIN users u ON r.admin_id = u.id
      WHERE r.ticket_id = ?
      ORDER BY r.created_at ASC
    `).all(ticketId);

    res.json({ ...ticket, replies });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب تفاصيل التذكرة.' });
  }
});

module.exports = router;
