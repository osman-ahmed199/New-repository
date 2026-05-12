import { useState, useEffect } from 'react';
import { getStatusText } from '../utils/translations';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'employee'
  });
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const API_BASE_URL = '/_/backend'; // Base URL للـ API مع experimental services

  // جلب كل المستخدمين
  const fetchUsers = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('🔄 جلب المستخدمين...');
      console.log('Token:', token ? 'موجود' : 'غير موجود');
      
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        setMessage(`❌ ${errorData.error || 'فشل في جلب المستخدمين'}`);
        return;
      }
      
      const data = await res.json();
      console.log('Users data:', data);
      
      if (Array.isArray(data)) {
        setUsers(data);
        setMessage(`✅ تم جلب ${data.length} مستخدم`);
      } else {
        console.error('Invalid data format:', data);
        setUsers([]);
        setMessage('❌ بيانات المستخدمين غير صالحة');
      }
    } catch (err) {
      console.error('Users fetch error:', err);
      setMessage('❌ حدث خطأ في الاتصال بالخادم');
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // إنشاء مستخدم جديد
  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      setMessage('❌ يرجى ملء كل الحقول');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (res.ok) {
        setMessage('✅ تم إنشاء المستخدم بنجاح');
        setNewUser({ username: '', password: '', role: 'employee' });
        setShowCreateForm(false);
        fetchUsers();
      } else {
        const error = await res.json();
        setMessage(`❌ ${error.error || 'فشل في إنشاء المستخدم'}`);
      }
    } catch (err) {
      console.error('Create user error:', err);
      setMessage('❌ حدث خطأ في إنشاء المستخدم');
    }
  };

  // حذف مستخدم
  const deleteUser = async (username) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${username}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setMessage('✅ تم حذف المستخدم بنجاح');
        fetchUsers();
      } else {
        const error = await res.json();
        setMessage(`❌ ${error.error || 'فشل في حذف المستخدم'}`);
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setMessage('❌ حدث خطأ في حذف المستخدم');
    }
  };

  // تغيير كلمة المرور
  const changePassword = async (username, newPassword) => {
    if (!newPassword) {
      setMessage('❌ يرجى إدخال كلمة مرور جديدة');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${username}/password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (res.ok) {
        setMessage('✅ تم تغيير كلمة المرور بنجاح');
        setEditingUser(null);
      } else {
        const error = await res.json();
        setMessage(`❌ ${error.error || 'فشل في تغيير كلمة المرور'}`);
      }
    } catch (err) {
      console.error('Change password error:', err);
      setMessage('❌ حدث خطأ في تغيير كلمة المرور');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showCreateForm ? 'إلغاء' : '➕ إنشاء مستخدم جديد'}
        </button>
      </div>

      {/* رسائل التنبيه */}
      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* نموذج إنشاء مستخدم جديد */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">إنشاء مستخدم جديد</h2>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="أدخل كلمة المرور"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="employee">موظف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              إنشاء المستخدم
            </button>
          </form>
        </div>
      )}

      {/* جدول المستخدمين */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">جاري تحميل المستخدمين...</div>
          </div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">المعرف</th>
                <th className="p-3">اسم المستخدم</th>
                <th className="p-3">الدور</th>
                <th className="p-3">تاريخ الإنشاء</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{user.id}</td>
                  <td className="p-3 font-medium">{user.username}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 border-purple-200' 
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {user.role === 'admin' ? '👨‍💼 مدير' : '👨‍💻 موظف'}
                    </span>
                  </td>
                  <td className="p-3">{new Date(user.created_at).toLocaleDateString('ar-SA')}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingUser(editingUser === user.username ? null : user.username)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                      >
                        🔐 تغيير كلمة المرور
                      </button>
                      <button
                        onClick={() => deleteUser(user.username)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        disabled={user.username === 'admin'}
                        title={user.username === 'admin' ? 'لا يمكن حذف المدير الرئيسي' : 'حذف المستخدم'}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* نموذج تغيير كلمة المرور */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">تغيير كلمة مرور: {editingUser}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="أدخل كلمة المرور الجديدة"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newPassword = document.getElementById('newPassword').value;
                    changePassword(editingUser, newPassword);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
