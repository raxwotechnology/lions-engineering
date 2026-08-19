import { initialMockState } from './mockData';

const BASE_URL = '/api';

// Safe fetch wrapper with 401 Automatic Token Expiry handling
export const fetchApi = async (endpoint, options = {}, mockFallback = null) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Automatic Token Expiry & 401 Unauthorized Handling
    if (res.status === 401) {
      console.warn('[Session Expired] 401 Unauthorized response received. Clearing tokens and redirecting.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?sessionExpired=true';
      }
      throw new Error('Session expired, please log in again.');
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const htmlText = await res.text();
      console.error(`[API HTML Error] Received non-JSON response for ${endpoint}:`, htmlText.substring(0, 150));
      throw new Error(`Non-JSON response received from server (${res.status})`);
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP error status: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`[API Fallback] Endpoint ${endpoint} warning (${err.message}). Utilizing mock fallback.`);
    return mockFallback;
  }
};

export const api = {
  getTools: () => fetchApi('/tools', {}, { success: true, tools: initialMockState.tools }),
  createTool: (data) => fetchApi('/tools', { method: 'POST', body: JSON.stringify(data) }, { success: true, tool: { ...data, id: `tl-${Date.now()}` } }),
  
  getCategories: () => fetchApi('/categories', {}, { success: true, categories: initialMockState.categories }),
  getCustomers: () => fetchApi('/customers', {}, { success: true, customers: initialMockState.customers }),
  getReservations: () => fetchApi('/reservations', {}, { success: true, reservations: initialMockState.reservations }),
  getTransactions: () => fetchApi('/transactions', {}, { success: true, transactions: initialMockState.transactions }),
  getQuotations: () => fetchApi('/quotations', {}, { success: true, quotations: initialMockState.quotations }),
  getExpenses: () => fetchApi('/expenses', {}, { success: true, expenses: initialMockState.expenses }),
  getSuppliers: () => fetchApi('/suppliers', {}, { success: true, suppliers: initialMockState.suppliers }),
  
  getDashboard: (role = 'Admin') => fetchApi(`/dashboard?role=${role}`, {}, {
    success: true,
    role,
    metrics: {
      totalTools: initialMockState.tools.length,
      availableTools: initialMockState.tools.filter(t => t.status === 'Available').length,
      rentedTools: initialMockState.tools.filter(t => t.status === 'Rented').length,
      maintenanceTools: initialMockState.tools.filter(t => t.status === 'Maintenance').length,
      activeCustomers: initialMockState.customers.length,
      pendingReservations: initialMockState.reservations.filter(r => r.status === 'Pending').length,
      totalRevenue: 1475000,
      totalExpenses: 1070000,
      netProfit: 405000
    }
  }),
  
  getFinancialReport: () => fetchApi('/reports/financial', {}, {
    success: true,
    reportPeriod: 'August 2026',
    summary: {
      totalRevenue: 1475000,
      totalExpenses: 1070000,
      netProfit: 405000,
      profitMargin: '27.4%',
      totalRentals: 2,
      averageRentalValue: 737500
    }
  })
};
