document.addEventListener('DOMContentLoaded', () => {
  // If a valid session exists, skip login and send user to the right dashboard.
  const user = getUser();
  if (user) redirectByRole(user.role);

  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const btn = document.getElementById('loginBtn');

    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
      // Ask backend to validate credentials and return session details.
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('kgl_token', data.token);
      localStorage.setItem('kgl_user', JSON.stringify(data.user));
      redirectByRole(data.user.role);
    } catch (err) {
      showAlert('alertBox', err.message, 'error');
      btn.textContent = 'Login';
      btn.disabled = false;
    }
  });
});

function redirectByRole(role) {
  // Keep role-to-page mapping centralized so auth flow stays predictable.
  const map = { manager: '/pages/dashboard-manager.html', agent: '/pages/dashboard-agent.html', director: '/pages/dashboard-director.html' };
  window.location.href = map[role] || '/pages/login.html';
}
