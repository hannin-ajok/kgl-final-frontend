document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['manager', 'agent']);
  if (!user) return;
  document.getElementById('sidebarName').textContent = user.name;
  if (user.role !== 'manager') {
    // Agents can view stock but should not create procurement entries.
    const form = document.getElementById('procurementForm');
    if (form) {
      const card = form.closest('.card');
      if (card) card.style.display = 'none';
    }
    const headerText = document.querySelector('.page-header p');
    if (headerText) headerText.textContent = 'View available produce stock';
  }
  await loadStock();

  const form = document.getElementById('procurementForm');
  if (!form || user.role !== 'manager') return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    const payload = {
      name: document.getElementById('name').value.trim(),
      type: document.getElementById('type').value.trim(),
      tonnage: parseFloat(document.getElementById('tonnage').value),
      cost: parseFloat(document.getElementById('cost').value),
      salePrice: parseFloat(document.getElementById('salePrice').value),
      dealerName: document.getElementById('dealerName').value.trim(),
      dealerContact: document.getElementById('dealerContact').value.trim(),
      branch: user.branch
    };
    try {
      await apiFetch('/procurement', { method: 'POST', body: JSON.stringify(payload) });
      showAlert('alertBox', 'Produce recorded successfully!', 'success');
      e.target.reset();
      // Pull fresh stock immediately so the table reflects the new record.
      await loadStock();
    } catch (err) {
      showAlert('alertBox', err.message, 'error');
    }
    btn.textContent = 'Record Produce'; btn.disabled = false;
  });
});

async function loadStock() {
  try {
    const data = await apiFetch('/procurement');
    const tbody = document.getElementById('stockTable');
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#757575">No produce recorded yet.</td></tr>'; return; }
    tbody.innerHTML = data.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${p.type}</td>
        <td>${p.tonnage} t</td>
        <td>${formatMoney(p.salePrice)}</td>
        <td><span class="badge ${p.tonnage > 0 ? 'badge-success' : 'badge-danger'}">${p.tonnage > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
      </tr>`).join('');
  } catch (err) {
    showAlert('alertBox', 'Failed to load stock: ' + err.message, 'error');
  }
}
