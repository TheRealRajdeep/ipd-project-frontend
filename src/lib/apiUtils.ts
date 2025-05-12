import axios, { AxiosRequestConfig } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create request helper that logs details
export const createAPIRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  config?: AxiosRequestConfig
) => {
  // Get auth token
  const token = localStorage.getItem('auth_token');
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
    ...(config?.headers || {})
  };

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  // Log request
  console.log(`Starting ${method} Request:`, { url, data });
  
  try {
    let response;
    
    if (method === 'GET') {
      response = await axios.get(url, { 
        headers, 
        params: data,
        ...config 
      });
    } else if (method === 'POST') {
      response = await axios.post(url, data, { headers, ...config });
    } else if (method === 'PUT') {
      response = await axios.put(url, data, { headers, ...config });
    } else if (method === 'DELETE') {
      response = await axios.delete(url, { headers, ...config });
    }
    
    // Log response
    console.log('Response:', response?.status, response?.data);
    return response;
  } catch (error: any) {
    // Log error
    console.error('Response Error:', error.response?.status, error.response?.data);
    throw error;
  }
};