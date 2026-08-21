/* ---- Lakók lista ---- */
async function showResidentsList() {
  activeResidentId = null;
  document.getElementById('residentsListView').style.display = 'block';
  document.getElementById('residentDetailView').style.display = 'none';

  try {
    const response = await fetch(`${API_BASE_URL}/residents`);
    if (!response.ok) throw new Error('Hálózati hiba');
    const residentsData = await response.json();
    renderResidentsTable(residentsData);
  } catch (error) {
    console.error(error);
    showToast('Nem sikerült betölteni a lakók listáját.', true);
  }
}

function renderResidentsTable(list) {
  const tbody = document.getElementById('residentsTableBody');
  if (!tbody) return;
  
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Nincs a keresésnek megfelelő lakó.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(r => `
    <tr class="user-row clickable-row" onclick="openResidentDetail(${r.id})">
      <td>
        <div class="name-cell">
          <div class="avatar" style="background:var(--secondary);">${r.name ? r.name.charAt(0) : '?'}</div>
          <div>${escapeHtml(r.name || '')}</div>
        </div>
      </td>
      <td>${escapeHtml(r.room || '')}</td>
      <td>${escapeHtml(r.doctor || '')}</td>
      <td><span class="status-badge ${r.status === 'Aktív' ? 'status-aktiv' : 'status-figyelendo'}">${r.status || 'Aktív'}</span></td>
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

/* ---- Kereső ---- */
document.addEventListener('input', function(e) {
  if (e.target.id === 'residentSearch') {
    const q = e.target.value.trim().toLowerCase();
    fetch(`${API_BASE_URL}/residents`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(r =>
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.doctor && r.doctor.toLowerCase().includes(q))
        );
        renderResidentsTable(filtered);
      })
      .catch(err => console.error(err));
  }
});

/* ---- Modal & Műveletek ---- */
const residentOverlay = document.getElementById('residentModalOverlay');
const residentForm = document.getElementById('residentForm');

function clearResidentErrors() {
  ['res_fullName', 'res_room'].forEach(f => {
    const errEl = document.getElementById('err-' + f);
    const inputEl = document.getElementById(f);
    if (errEl) errEl.textContent = '';
    if (inputEl) inputEl.classList.remove('has-error');
  });
}

function openResidentModal(id) {
  clearResidentErrors();
  if (residentForm) residentForm.reset();
  
  if (id) {
    document.getElementById('editResidentId').value = id;
    document.getElementById('residentModalTitle').textContent = 'Lakó adatainak szerkesztése';
    document.getElementById('submitResidentBtn').textContent = 'Mentés';
  } else {
    document.getElementById('editResidentId').value = '';
    document.getElementById('residentModalTitle').textContent = 'Új lakó felvétele';
    document.getElementById('submitResidentBtn').textContent = 'Létrehozás';
  }
  if (residentOverlay) residentOverlay.classList.add('show');
}

function closeResidentModal() {
  if (residentOverlay) residentOverlay.classList.remove('show');
}

if (residentOverlay) {
  residentOverlay.addEventListener('click', e => {
    if (e.target === residentOverlay) closeResidentModal();
  });
}

if (residentForm) {
  residentForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearResidentErrors();

    const editId = document.getElementById('editResidentId').value;
    const name = document.getElementById('res_fullName').value.trim();
    const room = document.getElementById('res_room').value.trim();

    let valid = true;
    if (!name) {
      document.getElementById('err-res_fullName').textContent = 'A név megadása kötelező.';
      document.getElementById('res_fullName').classList.add('has-error');
      valid = false;
    }
    if (!room) {
      document.getElementById('err-res_room').textContent = 'A szoba megadása kötelező.';
      document.getElementById('res_room').classList.add('has-error');
      valid = false;
    }
    if (!valid) return;

    const payload = {
      name: name,
      room: room,
      status: document.getElementById('res_status').value,
      doctor: document.getElementById('res_doctor').value.trim(),
      birth_date: document.getElementById('res_birthDate').value.trim(),
      taj: document.getElementById('res_taj').value.trim(),
      phone: document.getElementById('res_phone').value.trim(),
      notes: document.getElementById('res_notes').value.trim()
    };

    const url = editId ? `${API_BASE_URL}/residents/${editId}` : `${API_BASE_URL}/residents`;
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(editId ? 'Adatok frissítve!' : 'Új lakó elmentve!');
        closeResidentModal();
        showResidentsList();
      } else {
        showToast('Hiba a mentés során.', true);
      }
    } catch (err) {
      console.error(err);
      showToast('Hálózati hiba a mentés során!', true);
    }
  });
}

async function deleteResident(id) {
  if (!confirm('Biztosan törlöd a lakót az adatbázisból?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/residents/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Lakó törölve.');
      showResidentsList();
    }
  } catch (err) {
    showToast('Hiba a törlés során!', true);
  }
}
