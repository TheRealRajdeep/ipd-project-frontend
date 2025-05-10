import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: {
    user_type: string;
    phone_number?: string;
    address?: string;
    company_name?: string;
  };
  auth_token?: string;
}

export const login = async (username: string, password: string): Promise<UserData> => {
  try {
    // First, get the token
    const tokenResponse = await axios.post(`${API_URL}/api-token-auth/`, { username, password });
    const token = tokenResponse.data.token;
    
    // Set the token in headers for the user data request
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    
    // Get user details with the token
    const userResponse = await axios.get(`${API_URL}/api/accounts/user/`);
    
    const userData = userResponse.data;
    userData.auth_token = token;
    
    // Store user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
      // Also store token in cookies for middleware
      document.cookie = `auth_token=${token}; path=/; max-age=${60*60*24*7}`; // 7 days
    }
    
    return userData;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  profile: {
    user_type: string;
    phone_number?: string;
    address?: string;
    company_name?: string;
  };
}): Promise<UserData> => {
  try {
    // The payload is already structured correctly according to what the backend expects
    const response = await axios.post(`${API_URL}/api/accounts/register/`, userData);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (user && user.auth_token) {
      await axios.post(`${API_URL}/api/accounts/logout/`, {}, {
        headers: { Authorization: `Token ${user.auth_token}` }
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear user from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
    // Clear auth headers
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getCurrentUser = (): UserData | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    const userData = JSON.parse(userStr);
    // Set the auth header if we have a user
    if (userData && userData.auth_token) {
      setAuthHeader(userData.auth_token);
    }
    return userData;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
