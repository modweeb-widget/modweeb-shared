async function getUserInfo(accessToken) {
  try {
    notify('جارٍ تسجيل الدخول، يرجى الانتظار...');
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user info');
    const user = await res.json();
    const userData = { name: user.name, email: user.email, image: user.picture };
    if (window.opener && !window.opener.closed) {
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userPicture', user.picture);
      if (!localStorage.getItem('userJoinDate'))
        localStorage.setItem('userJoinDate', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
      window.opener.postMessage({ type: 'loginSuccess', user: userData }, window.location.origin);
      window.opener.postMessage({ type: 'storageUpdate' }, window.location.origin);
      notify('تم تسجيل الدخول بنجاح!');
      setTimeout(() => window.close(), 1500);
    } else {
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userPicture', user.picture);
      if (!localStorage.getItem('userJoinDate'))
        localStorage.setItem('userJoinDate', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
      const redirect = new URLSearchParams(window.location.search).get('cbu') || '/';
      notify('تم تسجيل الدخول بنجاح!');
      setTimeout(() => { window.location.href = redirect; }, 1000);
    }
  } catch (err) {
    console.error(err);
    notify('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
  }
}

function initGSI() {
  if (typeof google !== 'undefined' && google.accounts) {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: '36053852280-iqmfrcu1m2vd8ai6sc4e10r6afaiiln0.apps.googleusercontent.com',
      scope: 'openid profile email',
      callback: (resp) => {
        if (resp && resp.access_token) getUserInfo(resp.access_token);
        else notify('لم يتم العثور على رمز الوصول. يرجى المحاولة مرة أخرى.');
      }
    });
    const btn = document.getElementById('custom-google-btn');
    if (btn) btn.addEventListener('click', () => client.requestAccessToken());
    if (window.opener) {
      try { window.resizeTo(500, 600); } catch(e) {}
    }
  } else {
    notify('فشل تحميل مكتبة جوجل للمصادقة. يرجى التحقق من اتصالك بالإنترنت.');
  }
}
if (typeof google !== 'undefined' && google.accounts) initGSI();
else window.onload = () => { if (typeof google !== 'undefined' && google.accounts) initGSI(); };
