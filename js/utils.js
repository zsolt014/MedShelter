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
  if(!dateStr) return 9999;
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

/* ============ DÁTUM KONVERZIÓ (a natív <input type="date"> ÉÉÉÉ-HH-NN
   formátuma és a rendszerben tárolt ÉÉÉÉ.HH.NN formátum között) ============ */
function toIsoDate(dotDate){
  if(!dotDate) return '';
  return dotDate.split('.').join('-');
}

function toDotDate(isoDate){
  if(!isoDate) return '';
  return isoDate.split('-').join('.');
}

/* ============ HÓNAP HOZZÁADÁSA (dot-formátumú dátumhoz) ============ */
function addMonthsToDate(dotDateStr, months){
  if(!dotDateStr) return '';
  const [y,m,d] = dotDateStr.split('.').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setMonth(dt.getMonth() + months);
  return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}`;
}

function todayDot(){
  return '2026.08.20';
}

/* Két dot-dátum összehasonlítása napokban (a - b) */
function diffInDaysDot(dotA, dotB){
  const [ya,ma,da] = dotA.split('.').map(Number);
  const [yb,mb,db] = dotB.split('.').map(Number);
  const a = new Date(ya, ma-1, da);
  const b = new Date(yb, mb-1, db);
  return Math.round((a - b) / 86400000);
}

/* ============ KÖZPONTI FRISSÍTÉS ============
   Minden adatmódosítás (lakó, gyógyszer, szakorvosi levél, buletin) után ezt
   kell meghívni, hogy a Dashboard, a Naptár és a Jelentések azonnal, minden
   további kattintás nélkül tükrözzék a valós, aktuális adatokat. */
function refreshAllViews(){
  if(typeof renderDashboard === 'function') renderDashboard();
  if(typeof renderCalendar === 'function' && document.getElementById('calendarGrid')) renderCalendar();
  if(typeof renderReports === 'function' && document.getElementById('statusBarChart')) renderReports();
  if(typeof renderMedicationsTable === 'function' && document.getElementById('medicationsTableBody')){
    const q = document.getElementById('medicationSearch');
    renderMedicationsTable(q ? q.value.trim().toLowerCase() : '');
  }
}
