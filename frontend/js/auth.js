// ── Toast ─────────────────────────────────────────────────────────────────────

function showToast(message, type = 'error') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Auto-dismiss after 4 s
  setTimeout(() => {
    toast.classList.add('toast-hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 4000);
}

// Expose globally so non-module scripts can call it
window.showToast = showToast;

// ── Auth ──────────────────────────────────────────────────────────────────────

const BACKEND_URL = window.BACKEND_URL !== undefined
  ? window.BACKEND_URL
  : 'http://localhost:8000';

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

    let response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch {
      showToast('Erro de conexão. Verifique sua internet.');
      return null;
    }

    if (response.status === 401) {
      showToast('Sua sessão expirou. Fazendo login novamente...', 'warn');
      setTimeout(() => this.logout(), 1500);
      return null;
    }

    if (response.status >= 500) {
      showToast('Algo deu errado. Tente novamente em instantes.');
      return null;
    }

    return response;
  },

  getBackendUrl() {
    return BACKEND_URL;
  },
};
