function logout() {
  localStorage.clear();
  notify('تم تسجيل الخروج بنجاح!');
  updateAccountInfo();
}
function setupEditProfileListeners() {
  const settingsBtn = document.getElementById('showSettingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const editForm = document.getElementById('editProfileForm');
  const editPicFile = document.getElementById('editPic');
  const editPicUrl = document.getElementById('editPicUrl');
  if (settingsBtn && settingsPanel) {
    settingsBtn.onclick = (e) => { e.stopPropagation(); settingsPanel.classList.toggle('active'); };
    document.addEventListener('click', (event) => {
      if (settingsPanel && settingsBtn && !settingsPanel.contains(event.target) && !settingsBtn.contains(event.target))
        settingsPanel.classList.remove('active');
    });
  }
  const { name } = getUserData();
  const nameInput = document.getElementById('editName');
  if (nameInput && name) nameInput.value = name;
  if (editPicFile) {
    editPicFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const avatarImg = document.getElementById('avatarImg');
          if (avatarImg) avatarImg.src = ev.target.result;
          if (editPicUrl) editPicUrl.value = '';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  if (editPicUrl) {
    editPicUrl.addEventListener('input', (e) => {
      const avatarImg = document.getElementById('avatarImg');
      if (avatarImg) avatarImg.src = e.target.value;
      if (editPicFile) editPicFile.value = '';
    });
  }
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('editName').value.trim();
      const file = editPicFile ? editPicFile.files[0] : null;
      const url = editPicUrl ? editPicUrl.value.trim() : '';
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          localStorage.setItem('userPicture', ev.target.result);
          localStorage.setItem('userName', newName);
          updateAccountInfo();
          notify('تم حفظ التعديلات بنجاح!');
          if (settingsPanel) settingsPanel.classList.remove('active');
        };
        reader.readAsDataURL(file);
      } else if (url) {
        localStorage.setItem('userPicture', url);
        localStorage.setItem('userName', newName);
        updateAccountInfo();
        notify('تم حفظ التعديلات بنجاح!');
        if (settingsPanel) settingsPanel.classList.remove('active');
      } else {
        localStorage.setItem('userName', newName);
        updateAccountInfo();
        notify('تم حفظ التعديلات بنجاح!');
        if (settingsPanel) settingsPanel.classList.remove('active');
      }
    });
  }
}
function updateAccountInfo() {
  const container = document.getElementById('accountCardContainer');
  if (!container) return;
  const { isLoggedIn, name, picture, email, joinDate } = getUserData();
  let finalJoinDate = joinDate;
  if (!finalJoinDate || finalJoinDate === 'undefined' || finalJoinDate === 'null') {
    finalJoinDate = new Date().toISOString();
    localStorage.setItem('userJoinDate', finalJoinDate);
  }
  if (isLoggedIn && name) {
    let sessions = getSessions();
    if (!sessions.find(s => s.isCurrent)) addCurrentSession();
    sessions = getSessions();
    let sessionsHTML = '';
    sessions.sort((a, b) => b.id - a.id).forEach((s, i) => {
      const originalIndex = getSessions().findIndex(ss => ss.id === s.id);
      sessionsHTML += `<div class="flex flex-wrap gap-2 items-center justify-between p-3 border rounded-md shadow-sm overflow-hidden" style="background: var(--contentB); border-color: var(--contentL);"><div class="overflow-hidden"><div class="text-sm" style="color: var(--bodyC);">🕐 الوقت: ${s.time}</div><div class="text-sm" style="color: var(--bodyC);">💻 النظام: ${s.os}</div><div class="text-sm" style="color: var(--bodyC);">🌐 IP: ${s.ip}</div><div class="text-sm" style="color: var(--bodyC);">📌 ${s.isCurrent ? 'جلستك الحالية' : 'جلسة سابقة'}</div></div>${s.isCurrent ? `<button onclick="logout()" class="button button-black">🚪 خروج</button>` : `<button onclick="removeSession(${originalIndex})" class="button" style="background:#ef4444;color:white;">🗑️ إزالة</button>`}</div>`;
    });
    container.innerHTML = `<div class="flex flex-col gap-3"><div class="compact-title font-bold" style="color: var(--headC);">👤 إدارة الحساب</div><div class="flex flex-wrap gap-4 items-center"><span><img id="avatarImg" src="${picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=0D8ABC&color=fff'}" width="80" height="80" style="border-radius:12px;border:1px solid var(--contentL);" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff';"></span><div><div class="text-lg font-semibold" style="color: var(--headC);">${name}</div><div style="color: var(--bodyC);">📧 ${email || 'غير متوفر'}</div><div style="color: var(--bodyC);">📅 تاريخ الانضمام: ${formatDate(finalJoinDate)}</div></div></div><div><div class="font-medium" style="color: var(--headC);">🔐 جلسات نشطة</div><div class="grid gap-2">${sessionsHTML}</div></div><div class="flex gap-2"><a href="/" class="button button-outline flex-1">🏠 الرئيسية</a><button onclick="logout()" class="button button-black flex-1">🚪 خروج</button></div></div>`;
    setupEditProfileListeners();
  } else {
    container.innerHTML = `<div class="alert-card"><div class="alert-card-header"><div class="alert-card-title">⚠️ أنت غير مسجل الدخول</div><div class="alert-card-description">يرجى تسجيل الدخول للوصول إلى حسابك.</div></div><div class="alert-card-footer"><a href="/" class="button button-outline flex-1">🏠 الرئيسية</a><a href="/p/login.html?cbu=/p/account.html" class="button button-black flex-1">🔑 دخول</a></div></div>`;
  }
}
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'loginSuccess') {
    const user = event.data.user;
    if (user) {
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userPicture', user.image || '');
      if (!localStorage.getItem('userJoinDate') || localStorage.getItem('userJoinDate') === 'undefined')
        localStorage.setItem('userJoinDate', new Date().toISOString());
      addCurrentSession();
      updateAccountInfo();
      notify('تم تسجيل الدخول بنجاح!');
    }
  }
});
document.addEventListener('DOMContentLoaded', updateAccountInfo);
window.addEventListener('storage', updateAccountInfo);
setTimeout(() => { addCurrentSession(); }, 500);
