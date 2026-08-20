/* ============ JELSZÓ LÁTHATÓSÁG ============ */
document.querySelectorAll('.toggle-visibility').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    target.type = target.type === 'password' ? 'text' : 'password';
  });
});

/* ============ BEJELENTKEZÉS ============ */
const loginForm = document.getElementById('loginForm');
const loginAlert = document.getElementById('loginAlert');

loginForm.addEventListener('submit', function(e){
  e.preventDefault();
  const uname = document.getElementById('loginUsername').value.trim();
  const pass = document.getElementById('loginPassword').value;

  const found = users.find(u => u.username.toLowerCase() === uname.toLowerCase() && u.password === pass);

  if(found){
    currentUser = found;
    loginAlert.innerHTML = '';
    enterApp();
  } else {
    loginAlert.innerHTML = '<div class="alert alert-error">Hibás felhasználónév vagy jelszó. Próbáld újra.</div>';
    const card = document.querySelector('.login-card');
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
  }
});

function enterApp(){
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').style.display = 'block';
  document.getElementById('topName').textContent = currentUser.fullName;
  document.getElementById('topRole').textContent = currentUser.role;
  document.getElementById('topAvatar').textContent = currentUser.fullName.charAt(0).toUpperCase();
  document.getElementById('loginForm').reset();
  renderUserTable();
  showPage('dashboard');
}

function logout(){
  currentUser = null;
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  loginAlert.innerHTML = '';
}