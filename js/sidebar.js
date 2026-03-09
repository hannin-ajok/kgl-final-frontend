(function() {
  const user = requireAuth();
  if (!user) return;

  document.getElementById('sidebarName').textContent = user.name;
  const roleLabels = { manager: 'Branch Manager', agent: 'Sales Agent', director: 'Director' };
  const roleEl = document.getElementById('sidebarRole');
  if (roleEl) roleEl.textContent = roleLabels[user.role] || user.role;

  const currentPage = window.location.pathname.split('/').pop();

  // Keep sidebar links role-aware so each user only sees relevant pages.
  const navsByRole = {
    manager: [
      { href: 'dashboard-manager.html', icon: '\u{1F4CA}', label: 'Dashboard' },
      { href: 'procurement.html', icon: '\u{1F4E6}', label: 'Procurement' },
      { href: 'sales.html', icon: '\u{1F6D2}', label: 'Sales' },
      { href: 'credit-sales.html', icon: '\u{1F4B3}', label: 'Credit Sales' },
      { href: 'reports.html', icon: '\u{1F4CB}', label: 'Reports' },
    ],
    agent: [
      { href: 'dashboard-agent.html', icon: '\u{1F4CA}', label: 'Dashboard' },
      { href: 'sales.html', icon: '\u{1F6D2}', label: 'Sales' },
      { href: 'credit-sales.html', icon: '\u{1F4B3}', label: 'Credit Sales' },
    ],
    director: [
      { href: 'dashboard-director.html', icon: '\u{1F4CA}', label: 'Summary Report' },
    ]
  };

  const links = navsByRole[user.role] || [];
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;

  // Mark current route as active for quick orientation in the app.
  nav.innerHTML = links.map(link => `
    <a href="${link.href}" class="${currentPage === link.href ? 'active' : ''}">
      <span class="icon">${link.icon}</span> ${link.label}
    </a>
  `).join('');
})();
