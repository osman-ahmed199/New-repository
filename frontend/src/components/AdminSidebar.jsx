import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { name: 'لوحة التحكم', icon: '📊', tab: 'dashboard' },
    { name: 'التذاكر', icon: '🎫', tab: 'tickets' },
    { name: 'إدارة المستخدمين', icon: '👥', tab: 'users' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 rtl:right-0 rtl:left-auto">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-reverse space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">👨‍💼</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user?.username || 'Admin'}</h3>
            <p className="text-sm text-gray-500">مدير النظام</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.tab}>
              <button
                onClick={() => setActiveTab(link.tab)}
                className={`w-full text-right px-4 py-3 rounded-lg flex items-center space-x-reverse space-x-3 transition-colors ${
                  activeTab === link.tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.name}</span>
              </button>
            </li>
          ))}
        </ul>
        
        <div className="mt-8 pt-8 border-t">
          <button
            onClick={handleLogout}
            className="w-full text-right px-4 py-3 rounded-lg flex items-center space-x-reverse space-x-3 text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
