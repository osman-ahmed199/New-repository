// دوال الترجمة الموحدة للنظام العربي

export const getStatusText = (status) => {
  const statusMap = {
    'open': 'مفتوحة',
    'in_progress': 'قيد المعالجة',
    'closed': 'مغلقة'
  };
  return statusMap[status] || status;
};

export const getPriorityText = (priority) => {
  const priorityMap = {
    'high': 'عالية',
    'medium': 'متوسطة',
    'low': 'منخفضة'
  };
  return priorityMap[priority] || priority;
};

export const getStatusBadgeClass = (status) => {
  const badgeClasses = {
    'open': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'closed': 'bg-green-100 text-green-800 border-green-200'
  };
  
  return `px-2 py-1 text-xs font-medium rounded-full border ${badgeClasses[status] || 'bg-gray-100 text-gray-800'}`;
};

export const getPriorityBadgeClass = (priority) => {
  const badgeClasses = {
    'high': 'bg-red-100 text-red-800 border-red-200',
    'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'low': 'bg-green-100 text-green-800 border-green-200'
  };
  
  return `px-2 py-1 text-xs font-medium rounded-full border ${badgeClasses[priority] || 'bg-gray-100 text-gray-800'}`;
};
