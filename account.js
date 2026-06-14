// ========== دالة تسجيل الخروج المركزية ==========
function logoutUser() {
  localStorage.clear();
  sessionStorage.removeItem('justLoggedOut');
  notify("تم تسجيل الخروج بنجاح");
  updateAccountInfo(); // تحديث الواجهة مباشرة (بدون إعادة تحميل)
}

// ========== معالجة ?logout=1 (كحماية إضافية) ==========
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('logout') === '1') {
    localStorage.clear();
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    notify("تم تسجيل الخروج بنجاح");
    updateAccountInfo();
  }
})();

// ========== تحديث معلومات الجلسة في الواجهة ==========
async function updateSessionInfo() {
  const timeEl = document.getElementById('sessionTime');
  const osEl = document.getElementById('sessionOS');
  const ipEl = document.getElementById('sessionIP');
  if (timeEl) timeEl.textContent = `الوقت: ${getCurrentTime()}`;
  if (osEl) osEl.textContent = `النظام: ${getOS()}`;
  if (ipEl) {
    ipEl.textContent = 'IP: جاري التحميل...';
    const ip = await getIP();
    ipEl.textContent = `IP: ${ip}`;
  }
}

// ========== إعدادات تعديل الملف الشخصي ==========
function setupEditProfileListeners() {
  const settingsBtn = document.getElementById('showSettingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const editForm = document.getElementById('editProfileForm');
  const editPicFile = document.getElementById('editPic');
  const editPicUrl = document.getElementById('editPicUrl');
  if (settingsBtn && settingsPanel) {
    settingsBtn.onclick = (e) => {
      e.stopPropagation();
      settingsPanel.classList.toggle('active');
    };
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

// ========== تحديث بطاقة الحساب الرئيسية ==========
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
      sessionsHTML += `<div class="flex flex-wrap gap-2 items-center justify-between p-3 border rounded-md shadow-sm overflow-hidden" style="background: var(--contentB); border-color: var(--contentL);">
        <div class="overflow-hidden">
          <div class="text-sm flex items-center gap-1.5" style="color: var(--bodyC);"><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M20.75 13.25C20.75 18.08 16.83 22 12 22C7.17 22 3.25 18.08 3.25 13.25C3.25 8.42 7.17 4.5 12 4.5C16.83 4.5 20.75 8.42 20.75 13.25Z'></path><path d='M12 8V13'></path><path d='M9 2H15' stroke-miterlimit='10'></path></svg><span class="truncate">الوقت: ${s.time}</span></div>
          <div class="text-sm flex items-center gap-1.5" style="color: var(--bodyC);"><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M10 16.95H6.21C2.84 16.95 2 16.11 2 12.74V6.74003C2 3.37003 2.84 2.53003 6.21 2.53003H16.74C20.11 2.53003 20.95 3.37003 20.95 6.74003'></path><path d='M10 21.4699V16.95'></path><path d='M2 12.95H10'></path><path d='M6.73999 21.47H9.99999'></path><path d='M22 12.8V18.51C22 20.88 21.41 21.47 19.04 21.47H15.49C13.12 21.47 12.53 20.88 12.53 18.51V12.8C12.53 10.43 13.12 9.83997 15.49 9.83997H19.04C21.41 9.83997 22 10.43 22 12.8Z'></path><path d='M17.2445 18.25H17.2535'></path></svg><span class="truncate">النظام: ${s.os}</span></div>
          <div class="text-sm flex items-center gap-1.5" style="color: var(--bodyC);"><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M12 13.4299C13.7231 13.4299 15.12 12.0331 15.12 10.3099C15.12 8.58681 13.7231 7.18994 12 7.18994C10.2769 7.18994 8.88 8.58681 8.88 10.3099C8.88 12.0331 10.2769 13.4299 12 13.4299Z'></path><path d='M3.62001 8.49C5.59001 -0.169998 18.42 -0.159997 20.38 8.5C21.53 13.58 18.37 17.88 15.6 20.54C13.59 22.48 10.41 22.48 8.39001 20.54C5.63001 17.88 2.47001 13.57 3.62001 8.49Z'></path></svg><span class="truncate">IP: ${s.ip}</span></div>
          <div class="text-sm flex items-center gap-1.5" style="color: var(--bodyC);"><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M14.4399 19.05L15.9599 20.57L18.9999 17.53'></path><path d='M12.16 10.87C12.06 10.86 11.94 10.86 11.83 10.87C9.44997 10.79 7.55997 8.84 7.55997 6.44C7.54997 3.99 9.53997 2 11.99 2C14.44 2 16.43 3.99 16.43 6.44C16.43 8.84 14.53 10.79 12.16 10.87Z'></path><path d='M11.99 21.8101C10.17 21.8101 8.36004 21.3501 6.98004 20.4301C4.56004 18.8101 4.56004 16.1701 6.98004 14.5601C9.73004 12.7201 14.24 12.7201 16.99 14.5601'></path></svg><span class="truncate">${s.isCurrent ? 'جلستك الحالية' : 'جلسة سابقة'}</span></div>
        </div>
        ${s.isCurrent ? `<button onclick="logoutUser()" class="inline-flex items-center justify-center whitespace-nowrap transition-all shrink-0 outline-none gap-1.5 px-2.5 size-9 rounded-md" style="background: var(--linkB); color: var(--white);"><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54'></path><path d='M15 12H3.62'></path><path d='M5.85 8.6499L2.5 11.9999L5.85 15.3499'></path></svg></button>` : `<button onclick="removeSession(${originalIndex})" class="inline-flex items-center justify-center whitespace-nowrap transition-all shrink-0 outline-none gap-1.5 px-2.5 size-9 rounded-md" style="background: #ef4444; color: var(--white);"><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M3 6H21'></path><path d='M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6'></path><path d='M8 4V2H16V4'></path></svg></button>`}
      </div>`;
    });
    container.innerHTML = `<div class="mb-1"></div><div class="flex flex-col gap-3"><div class="compact-title font-bold" style="color: var(--headC);">إدارة الحساب</div><div class="text-sm compact-subtitle" style="color: var(--bodyC);">عرض حسابك وإدارته.</div><div class="flex flex-wrap gap-4 items-center"><span class="relative flex shrink-0 overflow-hidden select-none size-20 border rounded-md" style="border-color: var(--contentL);"><img id="avatarImg" src="${picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=0D8ABC&color=fff'}" class="size-full object-cover rounded-md" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff';"></span><div class="overflow-hidden"><div class="text-lg font-semibold wrap-break-word" id="profileName" style="color: var(--headC);">${name}</div><div class="text-sm flex items-center gap-1.5" style="color: var(--bodyC);"><span class="truncate">${email || 'غير متوفر'}</span><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M8.38 12L10.79 14.42L15.62 9.57996'></path><path d='M10.75 2.44995C11.44 1.85995 12.57 1.85995 13.27 2.44995L14.85 3.80995C15.15 4.06995 15.71 4.27995 16.11 4.27995H17.81C18.87 4.27995 19.74 5.14995 19.74 6.20995V7.90995C19.74 8.29995 19.95 8.86995 20.21 9.16995L21.57 10.7499C22.16 11.4399 22.16 12.5699 21.57 13.2699L20.21 14.8499C19.95 15.1499 19.74 15.7099 19.74 16.1099V17.8099C19.74 18.8699 18.87 19.7399 17.81 19.7399H16.11C15.72 19.7399 15.15 19.9499 14.85 20.2099L13.27 21.5699C12.58 22.1599 11.45 22.1599 10.75 21.5699L9.17 20.2099C8.87 19.9499 8.31 19.7399 7.91 19.7399H6.18C5.12 19.7399 4.25 18.8699 4.25 17.8099V16.0999C4.25 15.7099 4.04 15.1499 3.79 14.8499L2.44 13.2599C1.86 12.5699 1.86 11.4499 2.44 10.7599L3.79 9.16995C4.04 8.86995 4.25 8.30995 4.25 7.91995V6.19995C4.25 5.13995 5.12 4.26995 6.18 4.26995H7.91C8.3 4.26995 8.87 4.05995 9.17 3.79995L10.75 2.44995Z'></path></svg></div><div class="text-sm truncate" style="color: var(--bodyC);">تاريخ الانضمام: ${formatDate(finalJoinDate)}</div></div></div><div class="flex flex-col gap-2"><div class="font-medium" style="color: var(--headC);">جلسات نشطة</div><div class="grid gap-2">${sessionsHTML}</div></div><div class="flex gap-2"><a href="/" class="inline-flex items-center justify-center whitespace-nowrap transition-all outline-none gap-1.5 px-2.5 h-8 flex-1 rounded-md border text-sm font-medium" style="background: var(--contentB); border-color: var(--contentL); color: var(--bodyC);"><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M2 22H22' stroke-miterlimit='10'></path><path d='M2.94995 22L2.99995 9.96999C2.99995 9.35999 3.28995 8.78004 3.76995 8.40004L10.77 2.95003C11.49 2.39003 12.5 2.39003 13.23 2.95003L20.23 8.39003C20.72 8.77003 21 9.34999 21 9.96999V22' stroke-miterlimit='10'></path><path d='M15.5 11H8.5C7.67 11 7 11.67 7 12.5V22H17V12.5C17 11.67 16.33 11 15.5 11Z' stroke-miterlimit='10'></path><path d='M10 16.25V17.75' stroke-miterlimit='10'></path><path d='M10.5 7.5H13.5' stroke-miterlimit='10'></path></svg>الرئيسية</a><button onclick="logoutUser()" class="inline-flex items-center justify-center whitespace-nowrap transition-all outline-none gap-1.5 px-2.5 h-8 flex-1 rounded-md text-sm font-medium" style="background: var(--linkB); color: var(--white);"><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54'></path><path d='M15 12H3.62'></path><path d='M5.85 8.6499L2.5 11.9999L5.85 15.3499'></path></svg>خروج</button></div></div>`;
    setupEditProfileListeners();
    updateSessionInfo();
  } else {
    container.innerHTML = `<div class="alert-card"><div class="alert-card-header"><div class="alert-card-title">أنت غير مسجل الدخول</div><div class="alert-card-description">يرجى تسجيل الدخول للوصول إلى حسابك.</div></div><div class="alert-card-footer"><a href="/" class="button button-outline flex-1"><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M12 18V15'></path><path d='M10.07 2.81997L3.14002 8.36997C2.36002 8.98997 1.86002 10.3 2.03002 11.28L3.36002 19.24C3.60002 20.66 4.96002 21.81 6.40002 21.81H17.6C19.03 21.81 20.4 20.65 20.64 19.24L21.97 11.28C22.13 10.3 21.63 8.98997 20.86 8.36997L13.93 2.82997C12.86 1.96997 11.13 1.96997 10.07 2.81997Z'></path></svg>الرئيسية</a><a href="/p/login.html?cbu=/p/account.html" class="button button-black flex-1"><svg class='line' viewBox='0 0 24 24' width='14' height='14'><path d='M11.6801 14.62L14.2401 12.06L11.6801 9.5' stroke-miterlimit='10'></path><path d='M4 12.0601H14.17' stroke-miterlimit='10'></path><path d='M12 4C16.42 4 20 7 20 12C20 17 16.42 20 12 20' stroke-miterlimit='10'></path></svg>دخول</a></div></div>`;
  }
}

// ========== مستمعي الأحداث ==========
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
window.addEventListener('pageshow', (event) => { if (event.persisted) updateAccountInfo(); });
document.addEventListener('DOMContentLoaded', updateAccountInfo);
window.addEventListener('storage', updateAccountInfo);
setTimeout(() => { addCurrentSession(); }, 500);
