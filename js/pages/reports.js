/* ================= JELENTÉSEK ================= */
function renderReports(){
  const statusCounts = { 'Aktív':0, 'Figyelendő':0 };
  residents.forEach(r => statusCounts[r.status] = (statusCounts[r.status] || 0) + 1);
  const totalResidents = residents.length;

  const statusChart = document.getElementById('statusBarChart');
  if(statusChart){
    statusChart.innerHTML = Object.entries(statusCounts).map(([label, count]) => {
      const pct = totalResidents ? Math.round((count / totalResidents) * 100) : 0;
      const color = label === 'Aktív' ? 'var(--success)' : 'var(--warning)';
      return `
        <div class="bar-row">
          <div class="bar-row-label">${label}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${color};"></div></div>
          <div class="bar-row-value">${count}</div>
        </div>`;
    }).join('');
  }

  const letterCounts = { urgent:0, soon:0, ok:0 };
  residents.forEach(r => r.letters.forEach(l => letterCounts[urgencyOf(l.valid)]++));
  const totalLetters = letterCounts.urgent + letterCounts.soon + letterCounts.ok;
  const letterLabels = [
    { key:'urgent', label:'Lejárt', color:'var(--error)' },
    { key:'soon', label:'Hamarosan lejár', color:'var(--warning)' },
    { key:'ok', label:'Érvényes', color:'var(--success)' }
  ];
  const lettersChart = document.getElementById('lettersBarChart');
  if(lettersChart){
    lettersChart.innerHTML = letterLabels.map(l => {
      const count = letterCounts[l.key];
      const pct = totalLetters ? Math.round((count / totalLetters) * 100) : 0;
      return `
        <div class="bar-row">
          <div class="bar-row-label">${l.label}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${l.color};"></div></div>
          <div class="bar-row-value">${count}</div>
        </div>`;
    }).join('');
  }

  const buletinCounts = { urgent:0, soon:0, ok:0 };
  residents.forEach(r => {
    if(r.buletinExpiry) buletinCounts[urgencyOf(r.buletinExpiry)]++;
  });
  const totalBuletin = buletinCounts.urgent + buletinCounts.soon + buletinCounts.ok;
  const buletinLabels = [
    { key:'urgent', label:'Lejárt', color:'var(--error)' },
    { key:'soon', label:'Hamarosan lejár', color:'var(--warning)' },
    { key:'ok', label:'Érvényes', color:'var(--success)' }
  ];
  const buletinChart = document.getElementById('buletinBarChart');
  if(buletinChart){
    buletinChart.innerHTML = buletinLabels.map(l => {
      const count = buletinCounts[l.key];
      const pct = totalBuletin ? Math.round((count / totalBuletin) * 100) : 0;
      return `
        <div class="bar-row">
          <div class="bar-row-label">${l.label}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${l.color};"></div></div>
          <div class="bar-row-value">${count}</div>
        </div>`;
    }).join('');
  }

  const historyBody = document.getElementById('historyTableBody');
  if(historyBody){
    historyBody.innerHTML = historyLog.map(h => `
      <tr>
        <td>${h.date}</td>
        <td>${escapeHtml(h.user)}</td>
        <td>${escapeHtml(h.action)}</td>
      </tr>
    `).join('');
  }
}
