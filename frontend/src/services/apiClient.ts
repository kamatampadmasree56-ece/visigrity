const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem('visigrity_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (res.status === 401) {
      localStorage.removeItem('visigrity_token');
      localStorage.removeItem('visigrity_user');
      // If unauthorized on protected route, trigger an event or handle gracefully
    }

    if (!res.ok) {
      let errorDetail = 'API request failed';
      try {
        const errorJson = await res.json();
        errorDetail = errorJson.detail || errorDetail;
      } catch {
        errorDetail = res.statusText || errorDetail;
      }
      throw new Error(errorDetail);
    }

    // Handle empty responses
    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(res);
  }

  async getBlob(endpoint: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch blob: ${res.statusText}`);
    }
    return res.blob();
  }


  async post<T>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });
    return this.handleResponse<T>(res);
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(res);
  }

  async checkHealth(): Promise<{ status: string; service: string; version: string; blockchain_mode: string }> {
    return this.get<{ status: string; service: string; version: string; blockchain_mode: string }>('/health');
  }
}

export const apiClient = new ApiClient();
