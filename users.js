/* ============ FELHASZNÁLÓK TÁBLÁZAT ============ */
function renderUserTable(){
  const tbody = document.getElementById('userTableBody');
  tbody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.className = 'user-row';
    tr.innerHTML = `
      <td>
        <div class="name-cell">
          <div class="avatar" style="background:${u.role === 'Admin' ? 'var(--primary)' : u.role === 'Vezető' ? 'var(--success)' : 'var(--secondary)'};">${u.fullName.charAt(0).toUpperCase()}</div>
          <div>
            <div>${escapeHtml(u.fullName)}</div>
            <div class="username-tag">@${escapeHtml(u.username)}</div>
          </div>
        </div>
      </td>
      <td><span class="role-badge ${roleClassMap[u.role]}">${u.role}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="Szerkesztés" onclick="openEditModal(${u.id})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </button>
          <button class="icon-btn danger" title="Törlés" onclick="deleteUser(${u.id})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* ============ ÚJ / SZERKESZTÉS MODAL ============ */
const overlay = document.getElementById('userModalOverlay');
const userForm = document.getElementById('userForm');

document.getElementById('openCreateBtn').addEventListener('click', () => openCreateModal());

function clearErrors(){
  ['fullName','username','password','passwordConfirm'].forEach(f => {
    document.getElementById('err-' + f).textContent = '';
    document.getElementById(f).classList.remove('has-error');
  });
}

function openCreateModal(){
  clearErrors();
  userForm.reset();
  document.getElementById('editUserId').value = '';
  document.getElementById('modalTitle').textContent = 'Új felhasználó létrehozása';
  document.getElementById('submitUserBtn').textContent = 'Létrehozás';
  document.getElementById('password').placeholder = 'min. 6 karakter';
  document.getElementById('password').required = true;
  overlay.classList.add('show');
  setTimeout(() => document.getElementById('fullName').focus(), 50);
}

function openEditModal(id){
  const u = users.find(x => x.id === id);
  if(!u) return;
  clearErrors();
  document.getElementById('editUserId').value = id;
  document.getElementById('fullName').value = u.fullName;
  document.getElementById('username').value = u.username;
  document.getElementById('role').value = u.role;
  document.getElementById('password').value = '';
  document.getElementById('passwordConfirm').value = '';
  document.getElementById('password').placeholder = 'hagyd üresen, ha nem változik';
  document.getElementById('modalTitle').textContent = 'Felhasználó szerkesztése';
  document.getElementById('submitUserBtn').textContent = 'Mentés';
  overlay.classList.add('show');
}

function closeUserModal(){
  overlay.classList.remove('show');
}
overlay.addEventListener('click', e => { if(e.target === overlay) closeUserModal(); });

userForm.addEventListener('submit', function(e){
  e.preventDefault();
  clearErrors();

  const editId = document.getElementById('editUserId').value;
  const isEdit = !!editId;

  const fullName = document.getElementById('fullName').value.trim();
  const username = document.getElementById('username').value.trim();
  const role = document.getElementById('role').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  let valid = true;

  if(!fullName){
    document.getElementById('err-fullName').textContent = 'A teljes név megadása kötelező.';
    document.getElementById('fullName').classList.add('has-error');
    valid = false;
  }

  if(!username){
    document.getElementById('err-username').textContent = 'A felhasználónév megadása kötelező.';
    document.getElementById('username').classList.add('has-error');
    valid = false;
  } else {
    const clash = users.find(u => u.username.toLowerCase() === username.toLowerCase() && String(u.id) !== String(editId));
    if(clash){
      document.getElementById('err-username').textContent = 'Ez a felhasználónév már foglalt.';
      document.getElementById('username').classList.add('has-error');
      valid = false;
    }
  }

  if(!isEdit || password || passwordConfirm){
    if(!password || password.length < 6){
      document.getElementById('err-password').textContent = 'Legalább 6 karakter szükséges.';
      document.getElementById('password').classList.add('has-error');
      valid = false;
    }
    if(password !== passwordConfirm){
      document.getElementById('err-passwordConfirm').textContent = 'A két jelszó nem egyezik.';
      document.getElementById('passwordConfirm').classList.add('has-error');
      valid = false;
    }
  }

  if(!valid) return;

  if(isEdit){
    const u = users.find(x => String(x.id) === String(editId));
    if(u){
      u.fullName = fullName;
      u.username = username;
      u.role = role;
      if(password) u.password = password;
      if(currentUser && currentUser.id === u.id) currentUser = u;
    }
    showToast('Felhasználó mentve.');
  } else {
    users.push({ id: nextId++, fullName, username, password, role });
    showToast('Új felhasználó létrehozva.');
  }

  closeUserModal();
  renderUserTable();
  if(currentUser){
    document.getElementById('topName').textContent = currentUser.fullName;
    document.getElementById('topRole').textContent = currentUser.role;
    document.getElementById('topAvatar').textContent = currentUser.fullName.charAt(0).toUpperCase();
  }
});

function deleteUser(id){
  const u = users.find(x => x.id === id);
  if(!u) return;

  if(currentUser && currentUser.id === id){
    showToast('A saját fiókodat nem törölheted, amíg be vagy jelentkezve.', true);
    return;
  }
  const adminCount = users.filter(x => x.role === 'Admin').length;
  if(u.role === 'Admin' && adminCount <= 1){
    showToast('Legalább egy Admin felhasználónak maradnia kell.', true);
    return;
  }
  if(!confirm(`Biztosan törlöd "${u.fullName}" felhasználót?`)) return;

  users = users.filter(x => x.id !== id);
  renderUserTable();
  showToast('Felhasználó törölve.');
}