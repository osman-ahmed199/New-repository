import React, { useState, useEffect } from 'react';

const EmployeeDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found!');
      return;
    }
    
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/tickets/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      setError('حدث خطأ أثناء جلب التذاكر');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSelectedTicket(data);
    } catch (error) {
      setError('حدث خطأ أثناء جلب تفاصيل التذكرة');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTicket)
      });
      setNewTicket({ title: '', description: '', priority: 'medium' });
      setShowNewTicketForm(false);
      fetchTickets();
    } catch (error) {
      setError('حدث خطأ أثناء إنشاء التذكرة');
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low'
    };
    const labels = {
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة'
    };
    return (
      <span className={`badge ${badges[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'badge-open',
      in_progress: 'badge-in-progress',
      closed: 'badge-closed'
    };
    const labels = {
      open: 'مفتوحة',
      in_progress: 'قيد المعالجة',
      closed: 'مغلقة'
    };
    return (
      <span className={`badge ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">تذاكري</h1>
          <button
            onClick={() => setShowNewTicketForm(true)}
            className="btn btn-primary"
          >
            تذكرة جديدة
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* New Ticket Form Modal */}
        {showNewTicketForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">تذكرة جديدة</h3>
              <form onSubmit={handleCreateTicket}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    العنوان *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    الوصف *
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    الأولوية *
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-reverse space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketForm(false)}
                    className="btn btn-secondary"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    إرسال
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tickets List */}
        <div className="grid grid-cols-1 gap-4">
          {tickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">لا توجد تذاكر حالياً</p>
              <button
                onClick={() => setShowNewTicketForm(true)}
                className="mt-4 btn btn-primary"
              >
                إنشاء أول تذكرة
              </button>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => fetchTicketDetails(ticket.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2 space-y-reverse">
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Details Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedTicket.title}</h3>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500">الأولوية:</span>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">الحالة:</span>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">تاريخ الإنشاء:</span>
                  <div className="mt-1 text-sm">
                    {new Date(selectedTicket.created_at).toLocaleString('ar-SA')}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">الوصف:</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded">{selectedTicket.description}</p>
              </div>

              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">الردود:</h4>
                  <div className="space-y-4">
                    {selectedTicket.replies.map((reply) => (
                      <div key={reply.id} className="border-r-4 border-blue-500 pr-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{reply.admin_name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(reply.created_at).toLocaleString('ar-SA')}
                          </span>
                        </div>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
