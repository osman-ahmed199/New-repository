// ملف إدارة المستخدمين لنظام الدعم الفني
// User Management Script for Helpdesk System

const bcrypt = require('bcryptjs');
const db = require('./database');

// إنشاء مستخدم جديد
const createUser = async (username, password, role = 'employee') => {
  try {
    // التحقق من وجود المستخدم
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      throw new Error('اسم المستخدم موجود بالفعل');
    }

    // تشفير كلمة المرور
    const passwordHash = bcrypt.hashSync(password, 10);

    // إدخال المستخدم الجديد
    const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
      .run(username, passwordHash, role);

    console.log(`✅ تم إنشاء مستخدم ${username} بنجاح (ID: ${result.lastInsertRowid})`);
    return result.lastInsertRowid;
  } catch (error) {
    console.error(`❌ خطأ في إنشاء المستخدم: ${error.message}`);
    throw error;
  }
};

// عرض كل المستخدمين
const listUsers = () => {
  try {
    const users = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC').all();
    
    console.log('\n📋 قائمة المستخدمين:');
    console.log('─'.repeat(50));
    users.forEach(user => {
      const role = user.role === 'admin' ? '👨‍💼 مدير' : '👨‍💻 موظف';
      const date = new Date(user.created_at).toLocaleDateString('ar-SA');
      console.log(`ID: ${user.id} | ${user.username} | ${role} | ${date}`);
    });
    console.log('─'.repeat(50));
    
    return users;
  } catch (error) {
    console.error(`❌ خطأ في عرض المستخدمين: ${error.message}`);
    throw error;
  }
};

// حذف مستخدم
const deleteUser = (username) => {
  try {
    const result = db.prepare('DELETE FROM users WHERE username = ?').run(username);
    
    if (result.changes === 0) {
      throw new Error('المستخدم غير موجود');
    }
    
    console.log(`✅ تم حذف المستخدم ${username} بنجاح`);
    return true;
  } catch (error) {
    console.error(`❌ خطأ في حذف المستخدم: ${error.message}`);
    throw error;
  }
};

// تغيير كلمة مرور مستخدم
const changePassword = (username, newPassword) => {
  try {
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    const result = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?')
      .run(passwordHash, username);
    
    if (result.changes === 0) {
      throw new Error('المستخدم غير موجود');
    }
    
    console.log(`✅ تم تغيير كلمة مرور ${username} بنجاح`);
    return true;
  } catch (error) {
    console.error(`❌ خطأ في تغيير كلمة المرور: ${error.message}`);
    throw error;
  }
};

// إنشاء مستخدمين تجريبيين
const createTestUsers = async () => {
  const testUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'employee1', password: 'emp123', role: 'employee' },
    { username: 'employee2', password: 'emp123', role: 'employee' },
    { username: 'employee3', password: 'emp123', role: 'employee' }
  ];

  console.log('🔄 إنشاء المستخدمين التجريبيين...');
  
  for (const user of testUsers) {
    try {
      await createUser(user.username, user.password, user.role);
    } catch (error) {
      console.log(`⚠️ ${user.username} موجود بالفعل`);
    }
  }
};

// واجهة سطر الأوامر
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create':
      if (args.length < 3) {
        console.log('📝 الاستخدام: node userManagement.js create <username> <password> [role]');
        console.log('📝 مثال: node userManagement.js create ahmed password123 employee');
        break;
      }
      createUser(args[1], args[2], args[3] || 'employee');
      break;

    case 'delete':
      if (args.length < 2) {
        console.log('📝 الاستخدام: node userManagement.js delete <username>');
        break;
      }
      deleteUser(args[1]);
      break;

    case 'list':
      listUsers();
      break;

    case 'changepass':
      if (args.length < 3) {
        console.log('📝 الاستخدام: node userManagement.js changepass <username> <newpassword>');
        break;
      }
      changePassword(args[1], args[2]);
      break;

    case 'init':
      createTestUsers();
      break;

    default:
      console.log('🔧 أوامر إدارة المستخدمين:');
      console.log('  create <username> <password> [role]  - إنشاء مستخدم جديد');
      console.log('  delete <username>                   - حذف مستخدم');
      console.log('  list                                - عرض كل المستخدمين');
      console.log('  changepass <username> <newpassword> - تغيير كلمة المرور');
      console.log('  init                                - إنشاء مستخدمين تجريبيين');
      console.log('');
      console.log('📝 الأدوار: admin, employee');
      console.log('📝 مثال: node userManagement.js create ali mypass admin');
  }
}

module.exports = {
  createUser,
  listUsers,
  deleteUser,
  changePassword,
  createTestUsers
};
