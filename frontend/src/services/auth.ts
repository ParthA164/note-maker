import ApiService from './api';
import { AuthResponse, SignupData, LoginData, OTPData, GoogleAuthData, User } from '../types/auth';

export class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await ApiService.post<{ user: User }>('/auth/signup', data);
    return {
      success: response.success,
      message: response.message,
      data: response.data ? { token: '', user: response.data.user } : undefined
    };
  }

  async verifyOTP(data: OTPData): Promise<AuthResponse> {
    const response = await ApiService.post<{ token: string; user: User }>('/auth/verify-otp', data);
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response as AuthResponse;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await ApiService.post<{ token: string; user: User }>('/auth/login', data);
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response as AuthResponse;
  }

  async googleAuth(credentialToken: string): Promise<AuthResponse> {
    const response = await ApiService.post<{ token: string; user: User }>('/auth/google', { 
      token: credentialToken 
    });
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response as AuthResponse;
  }

  async getCurrentUser(): Promise<{ success: boolean; data?: { user: User } }> {
    return ApiService.get<{ user: User }>('/auth/me');
  }

  async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
    return ApiService.post('/auth/resend-otp', { email });
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return ApiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return ApiService.post('/auth/reset-password', { token, newPassword });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

const authService = new AuthService();
export default authService;