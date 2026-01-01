const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

class AdminApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication
  async login(credentials: { email: string; password: string }) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request('/admin/profile');
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request('/admin/stats');
  }

  // Users Management
  async getAllUsers(page = 1, limit = 20) {
    return this.request(`/admin/users?page=${page}&limit=${limit}`);
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Owners Management  
  async getAllOwners(page = 1, limit = 20) {
    return this.request(`/admin/owners?page=${page}&limit=${limit}`);
  }

  async deleteOwner(ownerId: string) {
    return this.request(`/admin/owners/${ownerId}`, {
      method: 'DELETE',
    });
  }

  // Properties Management
  async getAllProperties(page = 1, limit = 20) {
    return this.request(`/admin/properties?page=${page}&limit=${limit}`);
  }

  async deleteProperty(propertyId: string) {
    return this.request(`/admin/properties/${propertyId}`, {
      method: 'DELETE',
    });
  }

  async updatePropertyStatus(propertyId: string, status: string) {
    return this.request(`/admin/properties/${propertyId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Verification Requests
  async getVerificationRequests() {
    return this.request('/admin/verifications');
  }

  async approveVerification(requestId: string, notes?: string) {
    return this.request(`/admin/verifications/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reviewNotes: notes }),
    });
  }

  async rejectVerification(requestId: string, notes?: string) {
    return this.request(`/admin/verifications/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reviewNotes: notes }),
    });
  }

  // Admin Team Management (MAIN_ADMIN only)
  async getAllAdmins() {
    return this.request('/admin/team');
  }

  async createAdmin(data: { email: string; password: string; name: string; role: string }) {
    return this.request('/admin/team', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleAdminStatus(adminId: string) {
    return this.request(`/admin/team/${adminId}/toggle`, {
      method: 'PATCH',
    });
  }
}

export const adminApi = new AdminApiClient();