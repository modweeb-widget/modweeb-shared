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
