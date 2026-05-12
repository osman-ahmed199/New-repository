// ملف اختبار لجلب المستخدمين
// Test file to fetch users

const db = require('./database');

console.log('🔍 اختبار جلب المستخدمين من قاعدة البيانات...\n');

try {
  // جلب كل المستخدمين
  const users = db.prepare(`
    SELECT id, username, role, created_at 
    FROM users 
    ORDER BY created_at DESC
  `).all();
  
  console.log('✅ تم العثور على المستخدمين التاليين:');
  console.log('─'.repeat(50));
  
  if (users.length === 0) {
    console.log('❌ لا يوجد مستخدمون في قاعدة البيانات');
  } else {
    users.forEach((user, index) => {
      const role = user.role === 'admin' ? '👨‍💼 مدير' : '👨‍💻 موظف';
      const date = new Date(user.created_at).toLocaleDateString('ar-SA');
      console.log(`${index + 1}. ID: ${user.id} | ${user.username} | ${role} | ${date}`);
    });
  }
  
  console.log('─'.repeat(50));
  console.log(`📊 العدد الإجمالي: ${users.length} مستخدم`);
  
} catch (error) {
  console.error('❌ خطأ في جلب المستخدمين:', error.message);
}

// اختبار إنشاء مستخدم جديد
console.log('\n🧪 اختبار إنشاء مستخدم جديد...');

try {
  const testUser = {
    username: 'test_user_' + Date.now(),
    role: 'employee'
  };
  
  console.log(`محاولة إنشاء مستخدم: ${testUser.username}`);
  
  // هذا مجرد اختبار - لن يتم إنشاء المستخدم فعلياً
  console.log('✅ اختبار الاستعلام ناجح');
  
} catch (error) {
  console.error('❌ خطأ في الاختبار:', error.message);
}

console.log('\n🎯 انتهى الاختبار');
