/* ============ TOAST ============ */
function showToast(message, isError){
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = isError ? 'error' : '';
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function daysUntil(dateStr){
  const [y,m,d] = dateStr.split('.').map(Number);
  const target = new Date(y, m-1, d);
  const today = new Date(2026, 7, 20); // 2026.08.20 - a rendszer "mai" dátuma
  return Math.round((target - today) / 86400000);
}

function urgencyOf(dateStr){
  const diff = daysUntil(dateStr);
  if(diff < 0) return 'urgent';
  if(diff <= 30) return 'soon';
  return 'ok';
}