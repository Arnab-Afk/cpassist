import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          logout();
          return Promise.reject(error);
        }

        // Attempt to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        localStorage.setItem('access_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Update the authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Retry the original request
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error('Token refresh failed:', refreshError);
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to logout
const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  
  // Redirect to login page
  window.location.href = '/login';
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

// Helper function to get current user info
export const getCurrentUser = () => {
  return {
    username: localStorage.getItem('username'),
    email: localStorage.getItem('email'),
    accessToken: localStorage.getItem('access_token'),
  };
};

// Auth API functions
export const authAPI = {
  // Traditional login
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    const { accessToken, refreshToken, username: user, email } = response.data;
    
    // Store tokens
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('username', user);
    localStorage.setItem('email', email);
    
    return response.data;
  },

  // Traditional signup
  signup: async (username: string, email: string, password: string, fullName?: string) => {
    const response = await apiClient.post('/auth/signup', { 
      username, 
      email, 
      password,
      fullName 
    });
    return response.data;
  },

  // Logout
  logout: () => {
    logout();
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    localStorage.setItem('access_token', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken);
    }
    
    return response.data;
  },
};

// User API functions
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profile: any) => {
    const response = await apiClient.put('/users/profile', profile);
    return response.data;
  },

  // Update platform stats
  updatePlatformStats: async (stats: any) => {
    const response = await apiClient.put('/users/platform-stats', stats);
    return response.data;
  },

  // Mark problem as solved
  markSolved: async (problemId: string) => {
    const response = await apiClient.post(`/users/solved/${problemId}`);
    return response.data;
  },

  // Bookmark problem
  bookmarkProblem: async (problemId: string) => {
    const response = await apiClient.post(`/users/bookmark/${problemId}`);
    return response.data;
  },
};

// Problems API functions
export const problemsAPI = {
  // Get all problems
  getAll: async (params?: { page?: number; size?: number; topic?: string; difficulty?: string }) => {
    const response = await apiClient.get('/problems', { params });
    return response.data;
  },

  // Get problem by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/problems/${id}`);
    return response.data;
  },

  // Create problem (admin only)
  create: async (problem: any) => {
    const response = await apiClient.post('/problems', problem);
    return response.data;
  },

  // Update problem (admin only)
  update: async (id: string, problem: any) => {
    const response = await apiClient.put(`/problems/${id}`, problem);
    return response.data;
  },

  // Delete problem (admin only)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/problems/${id}`);
    return response.data;
  },
};

// Submissions API functions
export const submissionsAPI = {
  // Create submission
  create: async (submission: any) => {
    const response = await apiClient.post('/submissions', submission);
    return response.data;
  },

  // Get user submissions
  getUserSubmissions: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get('/submissions/user', { params });
    return response.data;
  },

  // Get submission by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/submissions/${id}`);
    return response.data;
  },

  // Get submissions for a specific problem
  getProblemSubmissions: async (problemId: string, params?: { page?: number; size?: number }) => {
    const response = await apiClient.get(`/submissions/problem/${problemId}`, { params });
    return response.data;
  },

  // Get user's accepted submissions
  getAccepted: async () => {
    const response = await apiClient.get('/submissions/user/accepted');
    return response.data;
  },

  // Get user's accepted count
  getAcceptedCount: async () => {
    const response = await apiClient.get('/submissions/user/accepted/count');
    return response.data;
  },
};

// Admin API functions
export const adminAPI = {
  // Dashboard stats
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // Users management
  users: {
    getAll: async () => {
      const response = await apiClient.get('/admin/users');
      return response.data;
    },
    
    toggleEnabled: async (userId: string, enabled: boolean) => {
      const response = await apiClient.patch(`/admin/users/${userId}/toggle`, { enabled });
      return response.data;
    },
    
    updateRoles: async (userId: string, roles: string[]) => {
      const response = await apiClient.patch(`/admin/users/${userId}/roles`, { roles });
      return response.data;
    },
    
    delete: async (userId: string) => {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    },
  },

  // Topics management
  topics: {
    create: async (topic: any) => {
      const response = await apiClient.post('/admin/topics', topic);
      return response.data;
    },
    
    update: async (topicId: string, topic: any) => {
      const response = await apiClient.put(`/admin/topics/${topicId}`, topic);
      return response.data;
    },
    
    delete: async (topicId: string) => {
      const response = await apiClient.delete(`/admin/topics/${topicId}`);
      return response.data;
    },
  },

  // Submissions monitoring
  submissions: {
    getAll: async () => {
      const response = await apiClient.get('/admin/submissions');
      return response.data;
    },
    
    getById: async (submissionId: string) => {
      const response = await apiClient.get(`/admin/submissions/${submissionId}`);
      return response.data;
    },
  },
};

export default apiClient;
