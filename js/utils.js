// Keep the API base in one place so moving environments is painless.
const API = 'http://localhost:5000/api';

function getToken() { return localStorage.getItem('kgl_token'); }
function getUser() { return JSON.parse(localStorage.getItem('kgl_user') || 'null'); }

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  // Every request uses JSON; add auth only when we actually have a token.
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function showAlert(containerId, message, type = 'success') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-UG', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMoney(amount) {
  return 'UGX ' + Number(amount).toLocaleString();
}

function requireAuth(allowedRoles = []) {
  const user = getUser();
  const token = getToken();
  // If session info is missing, treat it as logged out.
  if (!user || !token) { window.location.href = '/pages/login.html'; return null; }
  // Optional role gate for pages that should only be seen by specific users.
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    window.location.href = '/pages/login.html'; return null;
  }
  return user;
}

function logout() {
  localStorage.removeItem('kgl_token');
  localStorage.removeItem('kgl_user');
  window.location.href = '/pages/login.html';
}
