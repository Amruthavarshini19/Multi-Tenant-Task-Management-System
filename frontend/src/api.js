const BASE_URL = '/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  
  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
    } catch (e) {
        errorMsg = await res.text();
    }
    throw new Error(errorMsg);
  }
  
  if (res.status === 204) return null;
  return res.json();
};

export const setAuthToken = (data) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('userRole', data.user.role);
    localStorage.setItem('userId', data.user.id);
    if (data.user.email) localStorage.setItem('userEmail', data.user.email);
    if (data.orgName) localStorage.setItem('orgName', data.orgName);
};

export const clearAuthToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('orgName');
};
