/* ================= BEÁLLÍTÁSOK ================= */
function fillSettingsForm(){
  if(!currentUser) return;
  document.getElementById('settingsFullName').value = currentUser.fullName;
  document.getElementById('settingsEmail').value = currentUser.username + '@medshelter-demo.hu';
}

function saveSettingsProfile(){
  if(!currentUser) return;
  const newName = document.getElementById('settingsFullName').value.trim();
  if(!newName){
    showToast('A név nem lehet üres.', true);
    return;
  }
  currentUser.fullName = newName;
  const u = users.find(x => x.id === currentUser.id);
  if(u) u.fullName = newName;
  document.getElementById('topName').textContent = newName;
  document.getElementById('topAvatar').textContent = newName.charAt(0).toUpperCase();
  showToast('Profil mentve.');
}