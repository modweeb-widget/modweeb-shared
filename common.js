// ========== معالجة تسجيل الخروج ==========
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('logout') === '1') {
    localStorage.clear();
    const newUrl = window.location.pathname + (window.location.hash || '');
    window.history.replaceState({}, document.title, newUrl);
    notify('تم تسجيل الخروج بنجاح');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
})();

// ========== toast notification ==========
function notify(msg) {
  const toast = document.getElementById("toastMessage");
  if (toast) {
    toast.innerText = msg;
    toast.classList.add("active");
    setTimeout(() => toast.classList.remove("active"), 3000);
  } else if (window.opener && window.opener.PU && typeof window.opener.PU.tNtf === "function") {
    window.opener.PU.tNtf(msg);
  }
}

// ========== dark mode ==========
(function() {
  const container = document.querySelector('.login-fullpage');
  const toggle = document.getElementById('theme-toggle-btn');
  if (!container || !toggle) return;
  const saved = localStorage.getItem('standalone-theme');
  if (saved === 'dark') {
    container.classList.add('dark-mode');
    applyDarkMode(container);
  }
  toggle.addEventListener('click', () => {
    container.classList.toggle('dark-mode');
    const isDark = container.classList.contains('dark-mode');
    localStorage.setItem('standalone-theme', isDark ? 'dark' : 'light');
    applyDarkMode(container);
  });
  function applyDarkMode(el) {
    const isDark = el.classList.contains('dark-mode');
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--bodyB', '#1a1a1a');
      root.style.setProperty('--bodyC', '#e5e5e5');
      root.style.setProperty('--contentB', '#2d2d2d');
      root.style.setProperty('--contentL', '#404040');
      root.style.setProperty('--headC', '#ffffff');
      root.style.setProperty('--white', '#ffffff');
      root.style.setProperty('--notifB', '#1f2937');
      root.style.setProperty('--notifC', '#e5e5e5');
      if (toggle.querySelector('svg')) toggle.querySelector('svg').style.stroke = 'var(--white)';
    } else {
      root.style.setProperty('--bodyB', '#f9fafb');
      root.style.setProperty('--bodyC', '#1f2937');
      root.style.setProperty('--contentB', '#ffffff');
      root.style.setProperty('--contentL', '#e5e7eb');
      root.style.setProperty('--headC', '#111827');
      root.style.setProperty('--white', '#ffffff');
      root.style.setProperty('--notifB', '#1f2937');
      root.style.setProperty('--notifC', '#ffffff');
      if (toggle.querySelector('svg')) toggle.querySelector('svg').style.stroke = 'var(--bodyC)';
    }
  }
})();

// ========== preloader ==========
(function() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('e');
    preloader.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'opacity' && getComputedStyle(preloader).opacity === '0') preloader.remove();
    });
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => preloader.classList.add('h'), 1500));
  }
})();

// ========== دوال مشتركة ==========
function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'ويندوز';
  if (ua.includes('Mac')) return 'ماك';
  if (ua.includes('Linux')) return 'لينكس';
  if (ua.includes('Android')) return 'أندرويد';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'آيفون/آيباد';
  return 'غير معروف';
}
async function getIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch { return 'غير معروف'; }
}
function getCurrentTime() {
  return new Date().toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
function getUserData() {
  return {
    isLoggedIn: localStorage.getItem('userLoggedIn') === 'true',
    name: localStorage.getItem('userName'),
    picture: localStorage.getItem('userPicture'),
    email: localStorage.getItem('userEmail'),
    joinDate: localStorage.getItem('userJoinDate')
  };
}
function formatDate(d) {
  if (!d || d === 'undefined' || d === 'null') return 'غير محدد';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return 'غير محدد';
    return dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
  } catch { return 'غير محدد'; }
}
function getSessions() {
  try {
    const s = localStorage.getItem('userSessions');
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}
function saveSessions(sessions) {
  localStorage.setItem('userSessions', JSON.stringify(sessions));
}
function removeSession(index) {
  const sessions = getSessions();
  sessions.splice(index, 1);
  saveSessions(sessions);
  if (typeof updateAccountInfo === 'function') updateAccountInfo();
  notify('تم إزالة الجلسة بنجاح');
}
window.removeSession = removeSession;
async function addCurrentSession() {
  const cs = {
    id: Date.now(),
    time: getCurrentTime(),
    os: getOS(),
    ip: 'جاري التحميل...',
    isCurrent: true
  };
  const ip = await getIP();
  cs.ip = ip;
  const sessions = getSessions();
  const filtered = sessions.filter(s => !s.isCurrent);
  filtered.push(cs);
  saveSessions(filtered);
  if (typeof updateAccountInfo === 'function') updateAccountInfo();
  return cs;
}
