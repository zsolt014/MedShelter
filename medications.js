/* ================= GYÓGYSZEREK (globális nézet) ================= */
function renderMedicationsTable(filter){
  const rows = [];
  residents.forEach(r => {
    r.medications.forEach(m => {
      rows.push({ residentId:r.id, residentName:r.name, medId:m.id, med:m.name, last:m.last, next:m.next });
    });
  });
  const q = (filter || '').toLowerCase();
  const filtered = q ? rows.filter(x => x.med.toLowerCase().includes(q) || x.residentName.toLowerCase().includes(q)) : rows;

  const tbody = document.getElementById('medicationsTableBody');
  if(filtered.length === 0){
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">Nincs találat.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(x => {
    const urg = urgencyOf(x.next);
    const label = urg === 'urgent' ? 'Lejárt' : urg === 'soon' ? 'Hamarosan esedékes' : 'Rendben';
    const dotClass = urg === 'urgent' ? 'urgent' : urg === 'soon' ? 'soon' : 'today';
    return `
    <tr>
      <td>${escapeHtml(x.residentName)}</td>
      <td>${escapeHtml(x.med)}</td>
      <td>${x.last}</td>
      <td>${x.next}</td>
      <td><span class="validity-tag"><span class="dot ${dotClass}"></span>${label}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="Szerkesztés" onclick="openMedicationModal(${x.residentId}, ${x.medId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </button>
          <button class="icon-btn danger" title="Törlés" onclick="removeMedicationGlobal(${x.residentId}, ${x.medId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

document.addEventListener('input', function(e){
  if(e.target.id === 'medicationSearch'){
    renderMedicationsTable(e.target.value.trim().toLowerCase());
  }
});

function recordPrescription(residentId, medId){
  const r = residents.find(x => x.id === residentId);
  const m = r && r.medications.find(x => x.id === medId);
  if(!m) return;
  m.last = '2026.08.20';
  const nextDate = new Date(2026, 8, 20);
  m.next = `${nextDate.getFullYear()}.${String(nextDate.getMonth()+1).padStart(2,'0')}.${String(nextDate.getDate()).padStart(2,'0')}`;
  showToast(`Gyógyszerírás rögzítve: ${m.name}.`);
  openResidentDetail(residentId);
}

function removeMedication(residentId, medId){
  const r = residents.find(x => x.id === residentId);
  if(!r) return;
  if(!confirm('Biztosan törlöd ezt a gyógyszert a lakó listájáról?')) return;
  r.medications = r.medications.filter(m => m.id !== medId);
  showToast('Gyógyszer törölve.');
  openResidentDetail(residentId);
}

/* ---- Gyógyszer modal (felvétel / szerkesztés) ---- */
const medicationOverlay = document.getElementById('medicationModalOverlay');
const medicationForm = document.getElementById('medicationForm');

function clearMedicationErrors(){
  document.getElementById('err-med_name').textContent = '';
  document.getElementById('med_name').classList.remove('has-error');
}

function openMedicationModal(residentId, medId){
  clearMedicationErrors();
  medicationForm.reset();

  const residentSelectField = document.getElementById('med_resident_field');
  const residentSelect = document.getElementById('med_resident');

  if(residentId){
    residentSelectField.style.display = 'none';
    document.getElementById('editMedicationResidentId').value = residentId;
  } else {
    residentSelectField.style.display = 'block';
    residentSelect.innerHTML = residents.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
    document.getElementById('editMedicationResidentId').value = '';
  }

  if(medId){
    const r = residents.find(x => x.id === residentId);
    const m = r && r.medications.find(x => x.id === medId);
    if(!m) return;
    document.getElementById('editMedicationId').value = medId;
    document.getElementById('med_name').value = m.name;
    document.getElementById('med_dosage').value = m.dosage;
    document.getElementById('med_qty').value = m.qty;
    document.getElementById('med_last').value = m.last;
    document.getElementById('med_next').value = m.next;
    document.getElementById('medicationModalTitle').textContent = 'Gyógyszer szerkesztése';
    document.getElementById('submitMedicationBtn').textContent = 'Mentés';
  } else {
    document.getElementById('editMedicationId').value = '';
    document.getElementById('med_last').value = '2026.08.20';
    document.getElementById('med_next').value = '2026.09.20';
    document.getElementById('medicationModalTitle').textContent = 'Új gyógyszer hozzáadása';
    document.getElementById('submitMedicationBtn').textContent = 'Létrehozás';
  }

  medicationOverlay.classList.add('show');
  setTimeout(() => document.getElementById('med_name').focus(), 50);
}

function closeMedicationModal(){
  medicationOverlay.classList.remove('show');
}
medicationOverlay.addEventListener('click', e => { if(e.target === medicationOverlay) closeMedicationModal(); });

medicationForm.addEventListener('submit', function(e){
  e.preventDefault();
  clearMedicationErrors();

  const editId = document.getElementById('editMedicationId').value;
  let residentId = document.getElementById('editMedicationResidentId').value;
  if(!residentId){
    residentId = document.getElementById('med_resident').value;
  }
  residentId = Number(residentId);

  const name = document.getElementById('med_name').value.trim();
  const dosage = document.getElementById('med_dosage').value.trim();
  const qty = document.getElementById('med_qty').value.trim();
  const last = document.getElementById('med_last').value.trim();
  const next = document.getElementById('med_next').value.trim();

  if(!name){
    document.getElementById('err-med_name').textContent = 'A gyógyszer nevének megadása kötelező.';
    document.getElementById('med_name').classList.add('has-error');
    return;
  }

  const r = residents.find(x => x.id === residentId);
  if(!r){
    showToast('Válassz lakót a gyógyszerhez.', true);
    return;
  }

  if(editId){
    const m = r.medications.find(x => x.id === Number(editId));
    if(m) Object.assign(m, { name, dosage, qty, last, next });
    showToast('Gyógyszer mentve.');
  } else {
    r.medications.push({ id: nextMedicationId++, name, dosage, qty, last, next });
    showToast('Gyógyszer hozzáadva.');
  }

  closeMedicationModal();
  if(activeResidentId === r.id) openResidentDetail(r.id);
  if(document.getElementById('page-medications').classList.contains('active')){
    renderMedicationsTable(document.getElementById('medicationSearch').value.trim().toLowerCase());
  }
});

function removeMedicationGlobal(residentId, medId){
  const r = residents.find(x => x.id === residentId);
  if(!r) return;
  if(!confirm('Biztosan törlöd ezt a gyógyszeriratást?')) return;
  r.medications = r.medications.filter(m => m.id !== medId);
  showToast('Gyógyszeriratás törölve.');
  renderMedicationsTable(document.getElementById('medicationSearch').value.trim().toLowerCase());
}