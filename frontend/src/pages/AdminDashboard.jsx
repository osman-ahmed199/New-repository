import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import UserManagement from '../components/UserManagement';
import { getStatusText, getPriorityText, getStatusBadgeClass, getPriorityBadgeClass } from '../utils/translations';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'tickets') fetchTickets();
  }, [activeTab, statusFilter, searchQuery]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const url = params.toString() 
        ? `http://localhost:3000/api/admin/tickets?${params.toString()}`
        : 'http://localhost:3000/api/admin/tickets';
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Tickets error:', err);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedTicket(data);
    } catch (err) {
      console.error('Ticket details error:', err);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await fetch(`http://localhost:3000/api/admin/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      // Update selected ticket
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
      
      // Refresh tickets list
      fetchTickets();
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const sendReply = async (ticketId) => {
    if (!replyMessage.trim()) return;
    
    try {
      await fetch(`http://localhost:3000/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyMessage })
      });
      
      setReplyMessage('');
      // Refresh ticket details and tickets list
      fetchTicketDetails(ticketId);
      fetchTickets();
    } catch (err) {
      console.error('Send reply error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 mr-64 rtl:ml-64 rtl:mr-0 p-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'إجمالي التذاكر', value: stats?.total ?? '...', color: 'bg-blue-500' },
                { label: 'مفتوحة', value: stats?.open ?? '...', color: 'bg-yellow-500' },
                { label: 'قيد المعالجة', value: stats?.in_progress ?? '...', color: 'bg-orange-500' },
                { label: 'مغلقة', value: stats?.closed ?? '...', color: 'bg-green-500' },
              ].map((card, i) => (
                <div key={i} className={`${card.color} text-white rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold">{card.value}</div>
                  <div className="text-sm mt-1">{card.label}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <UserManagement />
          )}

          {activeTab === 'tickets' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Filters and Search */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث في العناوين..."
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">كل الحالات</option>
                      <option value="open">مفتوحة</option>
                      <option value="in_progress">قيد المعالجة</option>
                      <option value="closed">مغلقة</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <table className="w-full text-right">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">العنوان</th>
                    <th className="p-3">الأولوية</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">آخر تحديث</th>
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr 
                      key={t.id} 
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => fetchTicketDetails(t.id)}
                    >
                      <td className="p-3">{t.title}</td>
                      <td className="p-3"><span className={getPriorityBadgeClass(t.priority)}>{getPriorityText(t.priority)}</span></td>
                      <td className="p-3"><span className={getStatusBadgeClass(t.status)}>{getStatusText(t.status)}</span></td>
                      <td className="p-3">{new Date(t.updated_at || t.created_at).toLocaleDateString('ar')}</td>
                      <td className="p-3">
                        <button
                          onClick={() => window.print()}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          طباعة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Ticket Details Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold">{selectedTicket.title}</h2>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Ticket Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                      <div className="text-sm">{getPriorityBadge(selectedTicket.priority)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => setSelectedTicket({...selectedTicket, status: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="open">{getStatusText('open')}</option>
                          <option value="in_progress">{getStatusText('in_progress')}</option>
                          <option value="closed">{getStatusText('closed')}</option>
                        </select>
                        <button
                          onClick={() => updateTicketStatus(selectedTicket.id, selectedTicket.status)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                          حفظ
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      {selectedTicket.description}
                    </div>
                  </div>

                  {/* Reply Form */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">إرسال رد</label>
                    <div className="flex gap-2">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="اكتب ردك هنا..."
                        rows="3"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <button
                        onClick={() => sendReply(selectedTicket.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                      >
                        إرسال الرد
                      </button>
                    </div>
                  </div>

                  {/* Previous Replies */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">الردود السابقة</label>
                      <div className="space-y-3">
                        {selectedTicket.replies.map((reply) => (
                          <div key={reply.id} className="bg-blue-50 p-3 rounded-md">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">{reply.username || 'Admin'}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.created_at).toLocaleDateString('ar')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
