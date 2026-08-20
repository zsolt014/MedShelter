/* ---- Lakók lista ---- */
function showResidentsList(){
  activeResidentId = null;
  document.getElementById('residentsListView').style.display = 'block';
  document.getElementById('residentDetailView').style.display = 'none';
  renderResidentsTable(residents);
}

function renderResidentsTable(list){
  const tbody = document.getElementById('residentsTableBody');
  if(list.length === 0){
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Nincs a keresésnek megfelelő lakó.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(r => `
    <tr class="user-row clickable-row" onclick="openResidentDetail(${r.id})">
      <td>
        <div class="name-cell">
          <div class="avatar" style="background:var(--secondary);">${r.name.charAt(0)}</div>
          <div>${escapeHtml(r.name)}</div>
        </div>
      </td>
      <td>${escapeHtml(r.room)}</td>
      <td>${escapeHtml(r.doctor)}</td>
      <td><span class="status-badge ${r.status === 'Aktív' ? 'status-aktiv' : 'status-figyelendo'}">${r.status}</span></td>
      <td>
        <div class="row-actions" onclick="event.stopPropagation();">
          <button class="icon-btn" title="Szerkesztés" onclick="openResidentModal(${r.id})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </button>
          <button class="icon-btn danger" title="Törlés" onclick="deleteResident(${r.id})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

document.addEventListener('input', function(e){
  if(e.target.id === 'residentSearch'){
    const q = e.target.value.trim().toLowerCase();
    const filtered = residents.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.doctor.toLowerCase().includes(q) ||
      r.medications.some(m => m.name.toLowerCase().includes(q))
    );
    renderResidentsTable(filtered);
  }
});

/* ---- Lakó felvétel / szerkesztés ---- */
const residentOverlay = document.getElementById('residentModalOverlay');
const residentForm = document.getElementById('residentForm');

function clearResidentErrors(){
  ['res_fullName','res_room'].forEach(f => {
    document.getElementById('err-' + f).textContent = '';
    document.getElementById(f).classList.remove('has-error');
  });
}

function openResidentModal(id){
  clearResidentErrors();
  residentForm.reset();
  if(id){
    const r = residents.find(x => x.id === id);
    if(!r) return;
    document.getElementById('editResidentId').value = id;
    document.getElementById('res_fullName').value = r.name;
    document.getElementById('res_room').value = r.room;
    document.getElementById('res_status').value = r.status;
    document.getElementById('res_doctor').value = r.doctor;
    document.getElementById('res_birthDate').value = r.birthDate;
    document.getElementById('res_taj').value = r.taj;
    document.getElementById('res_phone').value = r.phone === '—' ? '' : r.phone;
    document.getElementById('res_notes').value = r.notes;
    document.getElementById('residentModalTitle').textContent = 'Lakó adatainak szerkesztése';
    document.getElementById('submitResidentBtn').textContent = 'Mentés';
  } else {
    document.getElementById('editResidentId').value = '';
    document.getElementById('residentModalTitle').textContent = 'Új lakó felvétele';
    document.getElementById('submitResidentBtn').textContent = 'Létrehozás';
  }
  residentOverlay.classList.add('show');
  setTimeout(() => document.getElementById('res_fullName').focus(), 50);
}

function closeResidentModal(){
  residentOverlay.classList.remove('show');
}
residentOverlay.addEventListener('click', e => { if(e.target === residentOverlay) closeResidentModal(); });

residentForm.addEventListener('submit', function(e){
  e.preventDefault();
  clearResidentErrors();

  const editId = document.getElementById('editResidentId').value;
  const name = document.getElementById('res_fullName').value.trim();
  const room = document.getElementById('res_room').value.trim();
  const status = document.getElementById('res_status').value;
  const doctor = document.getElementById('res_doctor').value.trim();
  const birthDate = document.getElementById('res_birthDate').value.trim();
  const taj = document.getElementById('res_taj').value.trim();
  const phone = document.getElementById('res_phone').value.trim();
  const notes = document.getElementById('res_notes').value.trim();

  let valid = true;
  if(!name){
    document.getElementById('err-res_fullName').textContent = 'A név megadása kötelező.';
    document.getElementById('res_fullName').classList.add('has-error');
    valid = false;
  }
  if(!room){
    document.getElementById('err-res_room').textContent = 'A szoba megadása kötelező.';
    document.getElementById('res_room').classList.add('has-error');
    valid = false;
  }
  if(!valid) return;

  if(editId){
    const r = residents.find(x => String(x.id) === String(editId));
    if(r){
      Object.assign(r, { name, room, status, doctor, birthDate, taj, phone: phone || '—', notes });
    }
    showToast('Lakó adatai mentve.');
    if(activeResidentId === r.id){
      openResidentDetail(r.id);
    }
  } else {
    residents.push({
      id: nextResidentId++, name, room, status, doctor, birthDate, taj, phone: phone || '—', notes,
      medications: [], letters: []
    });
    showToast('Új lakó felvéve.');
  }

  closeResidentModal();
  if(document.getElementById('residentsListView').style.display !== 'none'){
    showResidentsList();
  }
});

function deleteResident(id){
  const r = residents.find(x => x.id === id);
  if(!r) return;
  if(!confirm(`Biztosan törlöd "${r.name}" lakót és minden hozzá tartozó adatot?`)) return;
  residents.splice(residents.indexOf(r), 1);
  showToast('Lakó törölve.');
  showResidentsList();
}

/* ---- Lakó adatlap ---- */
function openResidentDetail(id){
  activeResidentId = id;
  const r = residents.find(x => x.id === id);
  if(!r) return;

  document.getElementById('residentsListView').style.display = 'none';
  const detail = document.getElementById('residentDetailView');
  detail.style.display = 'block';

  const medsRows = r.medications.length ? r.medications.map(m => `
    <tr>
      <td>${escapeHtml(m.name)}</td>
      <td>${escapeHtml(m.dosage)}</td>
      <td>${m.qty} db/hó</td>
      <td>
        <div class="row-actions" style="justify-content:flex-start;">
          <button class="icon-btn" title="Gyógyszerírás rögzítése" onclick="recordPrescription(${r.id}, ${m.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15h6M9 11h6"/></svg>
          </button>
          <button class="icon-btn" title="Szerkesztés" onclick="openMedicationModal(${r.id}, ${m.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </button>
          <button class="icon-btn danger" title="Törlés" onclick="removeMedication(${r.id}, ${m.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="4"><div class="empty-state">Ehhez a lakóhoz még nincs felvéve gyógyszer.</div></td></tr>`;

  const lettersRows = r.letters.length ? r.letters.map(l => {
    const urg = urgencyOf(l.valid);
    const label = urg === 'urgent' ? 'Lejárt' : urg === 'soon' ? 'Hamarosan lejár' : 'Érvényes';
    const dotClass = urg === 'urgent' ? 'urgent' : urg === 'soon' ? 'soon' : 'today';
    return `
    <tr>
      <td>${escapeHtml(l.specialty)}</td>
      <td>${escapeHtml(l.doctor)}</td>
      <td>${l.valid}</td>
      <td><span class="validity-tag"><span class="dot ${dotClass}"></span>${label}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="Szerkesztés" onclick="openLetterModal(${r.id}, ${l.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </button>
          <button class="icon-btn danger" title="Törlés" onclick="removeLetter(${r.id}, ${l.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="5"><div class="empty-state">Nincs rögzített szakorvosi levél.</div></td></tr>`;

  detail.innerHTML = `
    <button class="back-link" onclick="showResidentsList()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      Vissza a lakók listájához
    </button>

    <div class="profile-grid">
      <div class="profile-card">
        <div style="display:flex; align-items:flex-start; justify-content:space-between;">
          <div class="profile-avatar">${r.name.charAt(0)}</div>
          <button class="icon-btn" title="Adatok szerkesztése" onclick="openResidentModal(${r.id})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </button>
        </div>
        <div class="profile-name">${escapeHtml(r.name)}</div>
        <div class="profile-sub">${r.room}. szoba · ${r.status}</div>

        <div class="profile-field">
          <div class="profile-field-label">Születési dátum</div>
          <div class="profile-field-value">${r.birthDate || '—'}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label">TAJ/CNP</div>
          <div class="profile-field-value">${r.taj || '—'}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label">Családorvos</div>
          <div class="profile-field-value">${escapeHtml(r.doctor || '—')}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label">Telefonszám</div>
          <div class="profile-field-value">${r.phone}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label">Megjegyzés</div>
          <div class="profile-field-value">${r.notes ? escapeHtml(r.notes) : '—'}</div>
        </div>

        <button class="btn btn-danger-outline btn-sm" style="width:100%; margin-top:6px;" onclick="deleteResident(${r.id})">Lakó törlése</button>
      </div>

      <div>
        <div class="subpanel">
          <div class="subpanel-header">
            <h3>Gyógyszerek</h3>
            <button class="btn btn-secondary btn-sm" onclick="openMedicationModal(${r.id}, null)">+ Gyógyszer hozzáadása</button>
          </div>
          <table>
            <thead><tr><th>Gyógyszer</th><th>Adagolás</th><th>Havi menny.</th><th>Műveletek</th></tr></thead>
            <tbody>${medsRows}</tbody>
          </table>
        </div>

        <div class="subpanel">
          <div class="subpanel-header">
            <h3>Szakorvosi levelek</h3>
            <button class="btn btn-secondary btn-sm" onclick="openLetterModal(${r.id}, null)">+ Levél hozzáadása</button>
          </div>
          <table>
            <thead><tr><th>Szakterület</th><th>Orvos</th><th>Érvényes</th><th>Állapot</th><th style="text-align:right;">Műveletek</th></tr></thead>
            <tbody>${lettersRows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ---- Szakorvosi levél modal (felvétel / szerkesztés) ---- */
const letterOverlay = document.getElementById('letterModalOverlay');
const letterForm = document.getElementById('letterForm');

function clearLetterErrors(){
  ['letter_specialty','letter_valid'].forEach(f => {
    document.getElementById('err-' + f).textContent = '';
    document.getElementById(f).classList.remove('has-error');
  });
}

function openLetterModal(residentId, letterId){
  clearLetterErrors();
  letterForm.reset();
  document.getElementById('editLetterResidentId').value = residentId;

  if(letterId){
    const r = residents.find(x => x.id === residentId);
    const l = r && r.letters.find(x => x.id === letterId);
    if(!l) return;
    document.getElementById('editLetterId').value = letterId;
    document.getElementById('letter_specialty').value = l.specialty;
    document.getElementById('letter_doctor').value = l.doctor;
    document.getElementById('letter_valid').value = l.valid;
    document.getElementById('letterModalTitle').textContent = 'Szakorvosi levél szerkesztése';
    document.getElementById('submitLetterBtn').textContent = 'Mentés';
  } else {
    document.getElementById('editLetterId').value = '';
    document.getElementById('letterModalTitle').textContent = 'Új szakorvosi levél';
    document.getElementById('submitLetterBtn').textContent = 'Létrehozás';
  }

  letterOverlay.classList.add('show');
  setTimeout(() => document.getElementById('letter_specialty').focus(), 50);
}

function closeLetterModal(){
  letterOverlay.classList.remove('show');
}
letterOverlay.addEventListener('click', e => { if(e.target === letterOverlay) closeLetterModal(); });

letterForm.addEventListener('submit', function(e){
  e.preventDefault();
  clearLetterErrors();

  const residentId = Number(document.getElementById('editLetterResidentId').value);
  const editId = document.getElementById('editLetterId').value;
  const specialty = document.getElementById('letter_specialty').value.trim();
  const doctor = document.getElementById('letter_doctor').value.trim();
  const validDate = document.getElementById('letter_valid').value.trim();

  let valid = true;
  if(!specialty){
    document.getElementById('err-letter_specialty').textContent = 'A szakterület megadása kötelező.';
    document.getElementById('letter_specialty').classList.add('has-error');
    valid = false;
  }
  if(!validDate){
    document.getElementById('err-letter_valid').textContent = 'Az érvényesség dátuma kötelező.';
    document.getElementById('letter_valid').classList.add('has-error');
    valid = false;
  }
  if(!valid) return;

  const r = residents.find(x => x.id === residentId);
  if(!r) return;

  if(editId){
    const l = r.letters.find(x => x.id === Number(editId));
    if(l) Object.assign(l, { specialty, doctor, valid: validDate });
    showToast('Szakorvosi levél mentve.');
  } else {
    r.letters.push({ id: nextLetterId++, specialty, doctor, valid: validDate });
    showToast('Szakorvosi levél hozzáadva.');
  }

  closeLetterModal();
  if(activeResidentId === r.id) openResidentDetail(r.id);
});

function removeLetter(residentId, letterId){
  const r = residents.find(x => x.id === residentId);
  if(!r) return;
  if(!confirm('Biztosan törlöd ezt a szakorvosi levelet?')) return;
  r.letters = r.letters.filter(l => l.id !== letterId);
  showToast('Szakorvosi levél törölve.');
  openResidentDetail(residentId);
}