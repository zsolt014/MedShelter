/* ============ OLDALVÁLTÁS ============ */
function showPage(name){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item:not(.disabled)').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + name);
  if(page) page.classList.add('active');

  const navMap = {
    dashboard:'navDashboard', residents:'navResidents', medications:'navMedications',
    calendar:'navCalendar', reports:'navReports', users:'navUsers', settings:'navSettings'
  };
  const navId = navMap[name];
  if(navId) document.getElementById(navId).classList.add('active');

  if(name === 'residents') showResidentsList();
  if(name === 'medications') renderMedicationsTable();
  if(name === 'calendar') renderCalendar();
  if(name === 'reports') renderReports();
  if(name === 'settings') fillSettingsForm();
}