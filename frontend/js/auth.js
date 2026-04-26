const BACKEND_URL = window.BACKEND_URL || 'http://localhost:8000';
const TOKEN_KEY = 'hexagon_token';

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = 'login.html';
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  async fetchWithAuth(url, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      this.logout();
      return null;
    }

    return response;
  },

  getBackendUrl() {
    return BACKEND_URL;
  },
};
