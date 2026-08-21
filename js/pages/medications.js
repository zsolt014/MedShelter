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
  if(!tbody) return;
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

/* Gyors megújítás: ugyanaz a gyógyszer, új felírási dátum, +3 hónap érvényesség */
function recordPrescription(residentId, medId){
  const r = residents.find(x => x.id === residentId);
  const m = r && r.medications.find(x => x.id === medId);
  if(!m) return;
  m.last = todayDot();
  m.next = addMonthsToDate(todayDot(), 3);
  showToast(`Gyógyszerírás megújítva (3 hónapra): ${m.name}.`);
  if(activeResidentId === residentId) openResidentDetail(residentId);
  refreshAllViews();
}

function removeMedication(residentId, medId){
  const r = residents.find(x => x.id === residentId);
  if(!r) return;
  if(!confirm('Biztosan törlöd ezt a gyógyszert a lakó listájáról?')) return;
  r.medications = r.medications.filter(m => m.id !== medId);
  showToast('Gyógyszer törölve.');
  if(activeResidentId === residentId) openResidentDetail(residentId);
  refreshAllViews();
}

function removeMedicationGlobal(residentId, medId){
  const r = residents.find(x => x.id === residentId);
  if(!r) return;
  if(!confirm('Biztosan törlöd ezt a gyógyszeriratást?')) return;
  r.medications = r.medications.filter(m => m.id !== medId);
  showToast('Gyógyszeriratás törölve.');
  refreshAllViews();
}

/* ---- Gyógyszer modal (felvétel / szerkesztés) ----
   Új felíráskor egyszerre TÖBB gyógyszer is felvehető (mivel egy lakónak
   egyszerre, egy alkalommal írják fel a gyógyszereit, max. 3 hónapra).
   Szerkesztéskor csak az adott egy tétel módosítható. */
const medicationOverlay = document.getElementById('medicationModalOverlay');
const medicationForm = document.getElementById('medicationForm');
const medicationRowsContainer = document.getElementById('medicationRowsContainer');
const addMedRowBtn = document.getElementById('addMedRowBtn');

let medRowCounter = 0;

function medicationRowTemplate(rowId, data){
  data = data || {};
  return `
    <div class="med-row" data-row-id="${rowId}">
      <div class="field-row">
        <div class="field" style="flex:2;">
          <label>Gyógyszer neve</label>
          <input type="text" class="med-row-name" placeholder="pl. Aspenter" value="${data.name ? escapeHtml(data.name) : ''}">
        </div>
        <div class="field">
          <label>Adagolás</label>
          <input type="text" class="med-row-dosage" placeholder="pl. 1-0-1" value="${data.dosage ? escapeHtml(data.dosage) : ''}">
        </div>
        <div class="field">
          <label>Havi menny.</label>
          <input type="text" class="med-row-qty" placeholder="pl. 30" value="${data.qty !== undefined ? escapeHtml(String(data.qty)) : ''}">
        </div>
        <button type="button" class="icon-btn danger med-row-remove" title="Sor törlése" onclick="removeMedicationRow(this)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="error-text med-row-err"></div>
    </div>`;
}

function addMedicationRow(data){
  medRowCounter++;
  medicationRowsContainer.insertAdjacentHTML('beforeend', medicationRowTemplate(medRowCounter, data));
  updateMedRowRemoveButtons();
}

function removeMedicationRow(btn){
  const row = btn.closest('.med-row');
  if(medicationRowsContainer.querySelectorAll('.med-row').length <= 1) return; // legalább 1 sor maradjon
  row.remove();
  updateMedRowRemoveButtons();
}

function updateMedRowRemoveButtons(){
  const rows = medicationRowsContainer.querySelectorAll('.med-row');
  rows.forEach(row => {
    const removeBtn = row.querySelector('.med-row-remove');
    removeBtn.style.visibility = rows.length > 1 ? 'visible' : 'hidden';
  });
}

function clearMedicationErrors(){
  document.getElementById('err-med_next').textContent = '';
  document.getElementById('med_next').classList.remove('has-error');
  medicationRowsContainer.querySelectorAll('.med-row-err').forEach(e => e.textContent = '');
  medicationRowsContainer.querySelectorAll('.med-row-name').forEach(e => e.classList.remove('has-error'));
}

/* A felírás dátumának változásakor automatikusan felajánljuk a +3 hónapos
   lejáratot, de a mező kézzel felülírható (max. 3 hónapig). */
function autoSuggestNextDate(){
  const lastVal = document.getElementById('med_last').value;
  if(!lastVal) return;
  const lastDot = toDotDate(lastVal);
  const suggested = addMonthsToDate(lastDot, 3);
  document.getElementById('med_next').value = toIsoDate(suggested);
  document.getElementById('med_next').max = toIsoDate(suggested);
  document.getElementById('med_next').min = lastVal;
}

document.addEventListener('change', function(e){
  if(e.target.id === 'med_last'){
    autoSuggestNextDate();
  }
});

function openMedicationModal(residentId, medId){
  clearMedicationErrors();
  medicationForm.reset();
  medicationRowsContainer.innerHTML = '';
  medRowCounter = 0;

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
    /* --- Szerkesztés: egyetlen tétel, nincs sor hozzáadás --- */
    const r = residents.find(x => x.id === residentId);
    const m = r && r.medications.find(x => x.id === medId);
    if(!m) return;
    document.getElementById('editMedicationId').value = medId;
    addMedicationRow({ name:m.name, dosage:m.dosage, qty:m.qty });
    addMedRowBtn.style.display = 'none';
    document.getElementById('med_last').value = toIsoDate(m.last);
    document.getElementById('med_next').value = toIsoDate(m.next);
    document.getElementById('med_next').max = toIsoDate(addMonthsToDate(m.last, 3));
    document.getElementById('med_next').min = toIsoDate(m.last);
    document.getElementById('medicationModalTitle').textContent = 'Gyógyszer szerkesztése';
    document.getElementById('submitMedicationBtn').textContent = 'Mentés';
  } else {
    /* --- Új felírás: egyszerre több gyógyszer is hozzáadható --- */
    document.getElementById('editMedicationId').value = '';
    addMedicationRow();
    addMedRowBtn.style.display = 'inline-flex';
    document.getElementById('med_last').value = toIsoDate(todayDot());
    autoSuggestNextDate();
    document.getElementById('medicationModalTitle').textContent = 'Új gyógyszerfelírás';
    document.getElementById('submitMedicationBtn').textContent = 'Létrehozás';
  }

  medicationOverlay.classList.add('show');
  setTimeout(() => {
    const firstName = medicationRowsContainer.querySelector('.med-row-name');
    if(firstName) firstName.focus();
  }, 50);
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

  const lastIso = document.getElementById('med_last').value;
  const nextIso = document.getElementById('med_next').value;

  let valid = true;

  if(!lastIso){
    showToast('A felírás dátuma kötelező.', true);
    valid = false;
  }
  if(!nextIso){
    document.getElementById('err-med_next').textContent = 'A következő esedékesség dátuma kötelező.';
    document.getElementById('med_next').classList.add('has-error');
    valid = false;
  }

  if(lastIso && nextIso){
    const lastDot = toDotDate(lastIso);
    const nextDot = toDotDate(nextIso);
    const maxAllowed = addMonthsToDate(lastDot, 3);
    if(diffInDaysDot(nextDot, lastDot) < 0){
      document.getElementById('err-med_next').textContent = 'A következő dátum nem lehet a felírás dátuma előtt.';
      document.getElementById('med_next').classList.add('has-error');
      valid = false;
    } else if(diffInDaysDot(nextDot, maxAllowed) > 0){
      document.getElementById('err-med_next').textContent = 'A gyógyszer legfeljebb 3 hónapra írható fel egyszerre.';
      document.getElementById('med_next').classList.add('has-error');
      valid = false;
    }
  }

  const r = residents.find(x => x.id === residentId);
  if(!r){
    showToast('Válassz lakót a gyógyszerhez.', true);
    return;
  }

  const rowEls = Array.from(medicationRowsContainer.querySelectorAll('.med-row'));
  const rowsData = rowEls.map(rowEl => ({
    el: rowEl,
    name: rowEl.querySelector('.med-row-name').value.trim(),
    dosage: rowEl.querySelector('.med-row-dosage').value.trim(),
    qty: rowEl.querySelector('.med-row-qty').value.trim()
  }));

  const filledRows = rowsData.filter(row => row.name);
  if(filledRows.length === 0){
    rowsData.forEach(row => {
      row.el.querySelector('.med-row-name').classList.add('has-error');
      row.el.querySelector('.med-row-err').textContent = 'Add meg a gyógyszer nevét.';
    });
    valid = false;
  }

  if(!valid) return;

  const last = toDotDate(lastIso);
  const next = toDotDate(nextIso);

  if(editId){
    const m = r.medications.find(x => x.id === Number(editId));
    const row = filledRows[0];
    if(m && row) Object.assign(m, { name: row.name, dosage: row.dosage, qty: row.qty, last, next });
    showToast('Gyógyszer mentve.');
  } else {
    filledRows.forEach(row => {
      r.medications.push({ id: nextMedicationId++, name: row.name, dosage: row.dosage, qty: row.qty, last, next });
    });
    showToast(filledRows.length > 1 ? `${filledRows.length} gyógyszer felírva.` : 'Gyógyszer hozzáadva.');
  }

  closeMedicationModal();
  if(activeResidentId === r.id) openResidentDetail(r.id);
  refreshAllViews();
});
