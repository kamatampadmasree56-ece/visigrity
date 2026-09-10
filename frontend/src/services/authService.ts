import { apiClient } from './apiClient';
import type { User, Role } from '../types';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    avatar_url?: string;
    is_active: boolean;
    created_at: string;
  };
}

export const authService = {
  async register(name: string, email: string, password: string, role: Role): Promise<User> {
    const res = await apiClient.post<any>('/auth/register', {
      full_name: name,
      email,
      password,
      role,
    });
    return {
      id: res.id,
      name: res.full_name,
      email: res.email,
      role: res.role as Role,
      avatarUrl: res.avatar_url,
    };
  },

  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password: password || 'Demo123!',
    });
    localStorage.setItem('visigrity_token', res.access_token);
    const user: User = {
      id: res.user.id,
      name: res.user.full_name,
      email: res.user.email,
      role: res.user.role as Role,
      avatarUrl: res.user.avatar_url,
    };
    return { user, token: res.access_token };
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<any>('/auth/me');
    return {
      id: res.id,
      name: res.full_name,
      email: res.email,
      role: res.role as Role,
      avatarUrl: res.avatar_url,
    };
  },

  logout(): void {
    localStorage.removeItem('visigrity_token');
    localStorage.removeItem('visigrity_user');
  },
};
