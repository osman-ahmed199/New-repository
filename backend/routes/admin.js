const express = require('express');
const db = require('../database');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authMiddleware, adminOnly);

// Get all tickets with filters
router.get('/tickets', (req, res) => {
  const { status, priority } = req.query;
  
  let query = `
    SELECT t.*, u.username as created_by
    FROM tickets t
    JOIN users u ON t.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND t.status = ?';
    params.push(status);
  }

  if (priority) {
    query += ' AND t.priority = ?';
    params.push(priority);
  }

  query += ' ORDER BY t.created_at DESC';

  try {
    const tickets = db.prepare(query).all(...params);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب التذاكر.' });
  }
});

// Update ticket status
router.patch('/tickets/:id/status', (req, res) => {
  const ticketId = req.params.id;
  const { status } = req.body;

  if (!['open', 'in_progress', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'الحالة غير صالحة.' });
  }

  try {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'التذكرة غير موجودة.' });
    }

    db.prepare('UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, ticketId);

    // If closing the ticket, create notification
    if (status === 'closed') {
      db.prepare(`
        INSERT INTO notifications (user_id, ticket_id, message)
        VALUES (?, ?, ?)
      `).run(ticket.user_id, ticketId, `تم إغلاق تذكرتك: ${ticket.title}`);
    }

    res.json({ message: 'تم تحديث الحالة بنجاح.' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الحالة.' });
  }
});

// Reply to ticket
router.post('/tickets/:id/reply', (req, res) => {
  const ticketId = req.params.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'الرسالة مطلوبة.' });
  }

  try {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'التذكرة غير موجودة.' });
    }

    db.prepare(`
      INSERT INTO replies (ticket_id, admin_id, message)
      VALUES (?, ?, ?)
    `).run(ticketId, req.user.id, message);

    // Update ticket status to in_progress if it's open
    if (ticket.status === 'open') {
      db.prepare('UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('in_progress', ticketId);
    }

    // Create notification
    db.prepare(`
      INSERT INTO notifications (user_id, ticket_id, message)
      VALUES (?, ?, ?)
    `).run(ticket.user_id, ticketId, `تم الرد على تذكرتك: ${ticket.title}`);

    res.json({ message: 'تم إرسال الرد بنجاح.' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء إرسال الرد.' });
  }
});

// Get dashboard statistics
router.get('/dashboard', authMiddleware, adminOnly, (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM tickets').get().count;
    const open = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'open'").get().count;
    const in_progress = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'in_progress'").get().count;
    const closed = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'closed'").get().count;
    const high = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE priority = 'high'").get().count;
    const medium = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE priority = 'medium'").get().count;
    const low = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE priority = 'low'").get().count;

    res.json({ total, open, in_progress, closed, high, medium, low });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get user notifications
router.get('/notifications', authMiddleware, (req, res) => {
  try {
    const notifications = db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.user.id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);

    res.json({ message: 'تم تحديث الإشعار.' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الإشعار.' });
  }
});

module.exports = router;
