document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['manager', 'agent']);
  if (!user) return;
  // Load dropdown + table immediately so the page is usable on first render.
  await loadProduce();
  await loadSales();

  document.getElementById('produceSelect').addEventListener('change', function() {
    const opt = this.options[this.selectedIndex];
    document.getElementById('availableStock').value = opt.dataset.tonnage ? `${opt.dataset.tonnage} tonnes` : '';
  });

  document.getElementById('salesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    const payload = {
      produceId: document.getElementById('produceSelect').value,
      tonnage: parseFloat(document.getElementById('tonnage').value),
      amountPaid: parseFloat(document.getElementById('amountPaid').value),
      buyerName: document.getElementById('buyerName').value.trim()
    };
    try {
      await apiFetch('/sales', { method: 'POST', body: JSON.stringify(payload) });
      showAlert('alertBox', 'Sale recorded successfully!', 'success');
      e.target.reset();
      document.getElementById('availableStock').value = '';
      // Refresh both datasets so stock and sales history stay in sync after save.
      await loadProduce();
      await loadSales();
    } catch (err) {
      showAlert('alertBox', err.message, 'error');
    }
    btn.textContent = 'Record Sale'; btn.disabled = false;
  });
});

async function loadProduce() {
  const data = await apiFetch('/procurement');
  const sel = document.getElementById('produceSelect');
  sel.innerHTML = '<option value="">-- Select produce --</option>';
  // Only show produce that still has tonnage to sell.
  data.filter(p => p.tonnage > 0).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p._id;
    opt.textContent = `${p.name} (${p.type}) - ${p.tonnage}t available`;
    opt.dataset.tonnage = p.tonnage;
    sel.appendChild(opt);
  });
}

async function loadSales() {
  const data = await apiFetch('/sales');
  const tbody = document.getElementById('salesTable');
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#757575">No sales yet.</td></tr>'; return; }
  tbody.innerHTML = data.slice(0, 20).map(s =>
    `<tr><td>${s.produceName}</td><td>${s.tonnage}t</td><td>${formatMoney(s.amountPaid)}</td><td>${s.buyerName}</td><td>${formatDate(s.date)}</td></tr>`
  ).join('');
}
