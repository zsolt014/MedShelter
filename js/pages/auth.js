/* ============ JELSZÓ LÁTHATÓSÁG ============ */
document.querySelectorAll('.toggle-visibility').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target) {
      target.type = target.type === 'password' ? 'text' : 'password';
    }
  });
});

/* ============ BEJELENTKEZÉS ============ */
const loginForm = document.getElementById('loginForm');
const loginAlert = document.getElementById('loginAlert');

if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const uname = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uname, password: pass })
      });

      if (res.ok) {
        currentUser = await res.json();
        loginAlert.innerHTML = '';
        enterApp();
      } else {
        loginAlert.innerHTML = '<div class="alert alert-error">Hibás felhasználónév vagy jelszó.</div>';
        const card = document.querySelector('.login-card');
        if (card) {
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Hálózati hiba a bejelentkezéskor!', true);
    }
  });
}

function enterApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').style.display = 'block';
  document.getElementById('topName').textContent = currentUser.fullName;
  document.getElementById('topRole').textContent = currentUser.role;
  document.getElementById('topAvatar').textContent = currentUser.fullName.charAt(0).toUpperCase();
  if (loginForm) loginForm.reset();
  if (typeof renderUserTable === 'function') renderUserTable();
  showPage('dashboard');
}

function logout() {
  currentUser = null;
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  if (loginAlert) loginAlert.innerHTML = '';
}
