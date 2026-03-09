document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['manager', 'agent']);
  if (!user) return;
  document.getElementById('sidebarName').textContent = user.name;
  // Preload form choices and pending credits so users can act right away.
  await loadProduce();
  await loadCredits();

  document.getElementById('creditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    const payload = {
      produceId: document.getElementById('produceSelect').value,
      tonnage: parseFloat(document.getElementById('tonnage').value),
      amountDue: parseFloat(document.getElementById('amountDue').value),
      buyerName: document.getElementById('buyerName').value.trim(),
      nin: document.getElementById('nin').value.trim(),
      contact: document.getElementById('contact').value.trim(),
      location: document.getElementById('location').value.trim(),
      dispatchDate: document.getElementById('dispatchDate').value,
      dueDate: document.getElementById('dueDate').value,
    };
    try {
      await apiFetch('/credit', { method: 'POST', body: JSON.stringify(payload) });
      showAlert('alertBox', 'Credit sale recorded!', 'success');
      e.target.reset();
      // Update UI after save to reflect current stock and pending balances.
      await loadProduce();
      await loadCredits();
    } catch (err) {
      showAlert('alertBox', err.message, 'error');
    }
    btn.textContent = 'Record Credit Sale'; btn.disabled = false;
  });
});

async function loadProduce() {
  const data = await apiFetch('/procurement');
  const sel = document.getElementById('produceSelect');
  sel.innerHTML = '<option value="">-- Select produce --</option>';
  data.filter(p => p.tonnage > 0).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p._id; opt.textContent = `${p.name} (${p.type}) - ${p.tonnage}t`;
    sel.appendChild(opt);
  });
}

async function loadCredits() {
  const data = await apiFetch('/credit');
  const tbody = document.getElementById('creditTable');
  // This page is action-oriented, so  only list credits that still need payment.
  const pending = data.filter(c => c.status === 'pending');
  if (!pending.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#2e7d32">No pending credit sales.</td></tr>'; return; }
  tbody.innerHTML = pending.map(c => `
    <tr>
      <td><strong>${c.buyerName}</strong><br><small>${c.location}</small></td>
      <td>${c.produceName} - ${c.tonnage}t</td>
      <td>${formatMoney(c.amountDue)}</td>
      <td>${formatDate(c.dueDate)}</td>
      <td><button class="btn btn-sm btn-primary" onclick="markPaid('${c._id}')">Mark Paid</button></td>
    </tr>`).join('');
}

async function markPaid(id) {
  try {
    // Marking paid is a lightweight state change on the backend.
    await apiFetch(`/credit/${id}/pay`, { method: 'PATCH' });
    showAlert('alertBox', 'Marked as paid!', 'success');
    await loadCredits();
  } catch (err) {
    showAlert('alertBox', err.message, 'error');
  }
}
