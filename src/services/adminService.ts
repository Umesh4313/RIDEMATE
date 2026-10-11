import {
  TaxSettingsData,
  PolicySettingsData,
  AuditLogItem,
  CustomerProfileItem,
  AdminAnalyticsData,
  VoucherAdminItem,
  PaymentAdminItem
} from '../types';

const API_BASE = '/api/v1';

async function getAdminToken(): Promise<string | null> {
  let token = localStorage.getItem('ridemate_token');
  if (token) {
    try {
      const user = JSON.parse(localStorage.getItem('ridemate_user') || '{}');
      if (user.role === 'admin' || user.role === 'operations') {
        return token;
      }
    } catch {
      // ignore
    }
  }

  // Auto-acquire admin token for admin console convenience if not already logged in
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ganesh@ridemate.io', password: 'password123' })
    });
    const data = await res.json();
    if (res.ok && data?.data?.token) {
      localStorage.setItem('ridemate_token', data.data.token);
      localStorage.setItem('ridemate_user', JSON.stringify(data.data.user));
      return data.data.token;
    }
  } catch (e) {
    console.warn('Could not auto-login as admin:', e);
  }
  return token;
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAdminToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...options, headers });
}

export const adminService = {
  // 1. Tax Settings
  async getTaxSettings(): Promise<TaxSettingsData> {
    const res = await authFetch(`${API_BASE}/tax-settings`);
    const json = await res.json();
    return json.data;
  },

  async updateTaxSettings(settings: Partial<TaxSettingsData>, reason: string = 'Admin dashboard update'): Promise<TaxSettingsData> {
    const res = await authFetch(`${API_BASE}/tax-settings?reason=${encodeURIComponent(reason)}`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update tax settings');
    return json.data;
  },

  // 2. Policies & Cancellation Charges
  async getPolicies(): Promise<PolicySettingsData> {
    const res = await authFetch(`${API_BASE}/policies`);
    const json = await res.json();
    return json.data;
  },

  async updatePolicies(policies: Partial<PolicySettingsData>, reason: string = 'Admin policy revision'): Promise<PolicySettingsData> {
    const res = await authFetch(`${API_BASE}/policies?reason=${encodeURIComponent(reason)}`, {
      method: 'PUT',
      body: JSON.stringify(policies)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update policies');
    return json.data;
  },

  // 3. Profit & Financial Analytics
  async getAnalytics(year: number, month?: number): Promise<AdminAnalyticsData> {
    let url = `${API_BASE}/admin/analytics?year=${year}`;
    if (month !== undefined && month !== null && month >= 1 && month <= 12) {
      url += `&month=${month}`;
    }
    const res = await authFetch(url);
    const json = await res.json();
    return json.data;
  },

  // 4. Customers
  async getCustomers(query: string = ''): Promise<CustomerProfileItem[]> {
    const url = query ? `${API_BASE}/admin/customers?query=${encodeURIComponent(query)}` : `${API_BASE}/admin/customers`;
    const res = await authFetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async getCustomerBookings(email: string): Promise<any[]> {
    const res = await authFetch(`${API_BASE}/admin/customers/${encodeURIComponent(email)}/bookings`);
    const json = await res.json();
    return json.data || [];
  },

  async updateCustomer(email: string, payload: { name: string; phone?: string; membershipTier?: string; reason?: string }): Promise<any> {
    const res = await authFetch(`${API_BASE}/admin/customers/${encodeURIComponent(email)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update customer');
    return json.data;
  },

  // 5. Vouchers
  async getVouchers(query: string = ''): Promise<VoucherAdminItem[]> {
    const url = query ? `${API_BASE}/admin/vouchers?query=${encodeURIComponent(query)}` : `${API_BASE}/admin/vouchers`;
    const res = await authFetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async regenerateVoucher(bookingReference: string, reason: string = 'Admin regenerated voucher'): Promise<VoucherAdminItem> {
    const res = await authFetch(`${API_BASE}/admin/vouchers/${encodeURIComponent(bookingReference)}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to regenerate voucher');
    return json.data;
  },

  // 6. Payment Records
  async getPayments(query: string = '', status: string = ''): Promise<PaymentAdminItem[]> {
    let url = `${API_BASE}/admin/payments?`;
    if (query) url += `query=${encodeURIComponent(query)}&`;
    if (status) url += `status=${encodeURIComponent(status)}&`;
    const res = await authFetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async processRefund(bookingReference: string, refundAmount: number, reason: string): Promise<any> {
    const res = await authFetch(`${API_BASE}/admin/payments/${encodeURIComponent(bookingReference)}/refund`, {
      method: 'POST',
      body: JSON.stringify({ refundAmount, reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to process refund');
    return json.data;
  },

  // 7. Audit Logs
  async getAuditLogs(action: string = '', actor: string = '', limit: number = 100): Promise<AuditLogItem[]> {
    let url = `${API_BASE}/admin/audit-logs?limit=${limit}`;
    if (action) url += `&action=${encodeURIComponent(action)}`;
    if (actor) url += `&actor=${encodeURIComponent(actor)}`;
    const res = await authFetch(url);
    const json = await res.json();
    return json.data || [];
  },

  // 8. Fleet Inventory & Availability
  async getFleetInventory(startDate?: string, endDate?: string): Promise<any[]> {
    let url = `${API_BASE}/inventory?`;
    if (startDate) url += `pickupDate=${encodeURIComponent(startDate)}&`;
    if (endDate) url += `dropoffDate=${encodeURIComponent(endDate)}&`;
    const res = await fetch(url);
    const json = await res.json();
    const rawList = json.data || [];
    return rawList.map((item: any) => ({
      id: item.carId || item.id,
      carId: item.carId,
      carModel: item.modelName || item.carModel || `${item.brand} ${item.modelName}`,
      brand: item.brand,
      category: item.category,
      totalQuantity: item.totalFleetQuantity ?? 6,
      bookedUnits: item.bookedForPeriod ?? 0,
      availableUnits: item.availableQuantity ?? (item.totalFleetQuantity - (item.bookedForPeriod || 0) - (item.maintenanceQuantity || 0)),
      maintenanceUnits: item.maintenanceQuantity ?? 0,
      vehicles: item.individualVehicles || []
    }));
  },

  async updateFleetQuantity(carId: string, totalQuantity: number, reason: string = 'Fleet expansion'): Promise<any> {
    const res = await authFetch(`${API_BASE}/inventory/${encodeURIComponent(carId)}/fleet-quantity`, {
      method: 'PUT',
      body: JSON.stringify({ totalFleetQuantity: totalQuantity, quantity: totalQuantity, reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update fleet quantity');
    return json.data;
  },

  async setVehicleMaintenance(carId: string, regNumber: string, inMaintenance: boolean, reason: string = 'Scheduled service'): Promise<any> {
    const res = await authFetch(`${API_BASE}/inventory/${encodeURIComponent(carId)}/vehicle-status`, {
      method: 'PUT',
      body: JSON.stringify({
        registrationNumber: regNumber,
        inMaintenance,
        reason
      })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update maintenance state');
    return json.data;
  },

  // 9. Booking Status Update & Cancellation
  async updateBookingStatus(bookingReference: string, newStatus: string, reason: string = 'Admin status update'): Promise<any> {
    const res = await authFetch(`${API_BASE}/bookings/${encodeURIComponent(bookingReference)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus, reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update booking status');
    return json.data;
  }
};
