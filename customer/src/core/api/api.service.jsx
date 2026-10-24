import axios from 'axios';

const getBaseURL = () => {
  return import.meta.env.VITE_BASE_URL || '/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: true,
});

let isLoggingOut = false;

export const resetLogoutState = () => {
  isLoggingOut = false;
};

export const setupInterceptors = (onUnauthorized) => {
  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        const url = error.config?.url || '';
        const isAuthCheck = url.includes('/auth/me') || url.includes('/auths/me');
        const isExplicitSilent = error.config?.__options?.silent || error.config?.silent;
        const isAuthPage = typeof window !== 'undefined' && 
          (window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/forgot-password');

        // Do not trigger session expiry toast for routine initial auth check or if already on auth pages
        if (isAuthCheck || isExplicitSilent || isAuthPage) {
          return Promise.reject(error);
        }

        if (!isLoggingOut) {
          isLoggingOut = true;
          const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Session expired. Please login again.';
          onUnauthorized?.(message);
          setTimeout(() => {
            isLoggingOut = false;
          }, 3000);
        }
      }
      return Promise.reject(error);
    }
  );
};

export const getRequest = async (url, params = {}, headers = {}) => {
  const response = await api.get(url, { params, headers });
  return response.data;
};

export const postRequest = async (url, data = {}, headers = {}) => {
  const response = await api.post(url, data, { headers });
  return response.data;
};

export const putRequest = async (url, data = {}, headers = {}) => {
  const response = await api.put(url, data, { headers });
  return response.data;
};

export const patchRequest = async (url, data = {}, headers = {}) => {
  const response = await api.patch(url, data, { headers });
  return response.data;
};

export const deleteRequest = async (url, params = {}, headers = {}) => {
  const response = await api.delete(url, { params, headers });
  return response.data;
};

export const downloadFile = async (url, params) => {
  let filename = 'download';
  const response = await api.get(url, {
    responseType: 'blob',
    params: {...params, _t: Date.now()}, 
    validateStatus: null,
  });

  if (response.status >= 400) {
    const text = await response.data.text();
    let message = 'Export failed';
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {  }
    
    const err = new Error(message);
    err.response = { status: response.status, data: { message } };
    throw err;
  }

  const disposition = response.headers['content-disposition'] || '';
  const match = disposition.match(/filename="(.+)"/);
  if (match) filename = match[1];

  const blobUrl = window.URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blobUrl);

  return filename;
};


