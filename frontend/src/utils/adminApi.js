const API_BASE = 'http://localhost:5000/api/admin';

/**
 * Retrieves the authorization headers with Bearer token from localStorage
 */
export const getAdminHeaders = () => {
  const token = localStorage.getItem('lunsole_token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token && token !== 'null' && token !== 'undefined') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Reusable fetch wrapper for admin API endpoints
 */
export const adminFetch = async (endpoint, options = {}) => {
  const headers = getAdminHeaders();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  return response;
};
