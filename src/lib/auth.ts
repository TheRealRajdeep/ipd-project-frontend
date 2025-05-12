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
    console.log('Attempting login to:', `${API_URL}/api/accounts/login/`);
    
    // First approach - try with credentials mode for session-based auth
    try {
      const loginResponse = await axios.post(
        `${API_URL}/api/accounts/login/`, 
        { username, password },
        { 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          withCredentials: true
        }
      );
      
      console.log('Login response status:', loginResponse.status);
      console.log('Login response data:', JSON.stringify(loginResponse.data, null, 2));
      
      const userData = loginResponse.data;
      
      // Extract token from response
      const token = userData.auth_token || userData.token || userData.key;
      
      if (!token) {
        console.error('No auth token received in login response');
      } else {
        setAuthHeader(token);
      }
      
      // Store the user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
        document.cookie = `isAuthenticated=true; path=/; max-age=${60*60*24*7}`;
        if (token) {
          document.cookie = `auth_token=${token}; path=/; max-age=${60*60*24*7}`;
        }
      }
      
      return userData;
    } catch (credentialsError) {
      // If credentials mode fails, try without credentials as fallback
      console.log('Login with credentials failed, trying without credentials mode');
      
      const loginResponse = await axios.post(
        `${API_URL}/api/accounts/login/`, 
        { username, password },
        { 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
          // No withCredentials here
        }
      );
      
      const userData = loginResponse.data;
      const token = userData.auth_token || userData.token || userData.key;
      
      if (token) {
        setAuthHeader(token);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData));
          document.cookie = `isAuthenticated=true; path=/; max-age=${60*60*24*7}`;
          document.cookie = `auth_token=${token}; path=/; max-age=${60*60*24*7}`;
        }
      }
      
      return userData;
    }
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
    // Call logout endpoint to clear server-side session
    await axios.post(`${API_URL}/api/accounts/logout/`, {}, {
      withCredentials: true // Now properly configured on backend
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear client-side auth state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      setAuthHeader(null);
    }
  }
};

// Add this function if it doesn't exist:

export function getCurrentUser() {
  try {
    const userString = localStorage.getItem('user');
    console.log("Auth - getCurrentUser called", userString ? "User found" : "No user found");
    if (!userString) return null;
    const user = JSON.parse(userString);
    console.log("Auth - User role:", user.profile?.user_type);
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
