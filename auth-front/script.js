const logBox = document.getElementById('log');
const autoScroll = document.getElementById('autoScroll');
const accessPreview = document.getElementById('accessPreview');
const refreshPreview = document.getElementById('refreshPreview');
const apiInput = document.getElementById('apiBase');

let API_BASE = localStorage.getItem('apiBase') || apiInput.value;
let accessToken = localStorage.getItem('accessToken') || '';
let refreshToken = localStorage.getItem('refreshToken') || '';

function setApiBase(url) {
  API_BASE = url.replace(/\/$/, '');
  localStorage.setItem('apiBase', API_BASE);
  apiInput.value = API_BASE;
  log(`API définie: ${API_BASE}`);
}

setApiBase(API_BASE);
updateTokenPreview();

function log(message) {
  const time = new Date().toLocaleTimeString();
  logBox.textContent += `[${time}] ${message}\n`;
  if (autoScroll.checked) logBox.scrollTop = logBox.scrollHeight;
}

function updateTokenPreview() {
  accessPreview.textContent = accessToken ? `${accessToken.slice(0, 16)}...` : '-';
  refreshPreview.textContent = refreshToken ? `${refreshToken.slice(0, 16)}...` : '-';
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!response.ok) {
    const err = new Error(data.message || response.statusText);
    err.status = response.status;
    err.body = data;
    throw err;
  }
  return data;
}

function saveTokens({ jetonAcces, jetonRefresh }) {
  if (jetonAcces) {
    accessToken = jetonAcces;
    localStorage.setItem('accessToken', jetonAcces);
  }
  if (jetonRefresh) {
    refreshToken = jetonRefresh;
    localStorage.setItem('refreshToken', jetonRefresh);
  }
  updateTokenPreview();
}

function clearTokens() {
  accessToken = '';
  refreshToken = '';
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  updateTokenPreview();
}

function serializeForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

// Form handlers

// Inscription
 document.getElementById('formRegister').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = serializeForm(e.target);
  try {
    const data = await request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    saveTokens({ jetonAcces: data.jetonAcces, jetonRefresh: data.jetonRefresh });
    log(`Inscription ok pour ${data.utilisateur.email}`);
  } catch (err) {
    log(`Erreur inscription (${err.status || '??'}): ${JSON.stringify(err.body)}`);
  }
});

// Connexion
 document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = serializeForm(e.target);
  try {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    saveTokens({ jetonAcces: data.jetonAcces, jetonRefresh: data.jetonRefresh });
    log(`Connexion ok pour ${payload.identifiant}`);
  } catch (err) {
    log(`Erreur connexion (${err.status || '??'}): ${JSON.stringify(err.body)}`);
  }
});

// Rafraîchir
 document.getElementById('btnRefresh').addEventListener('click', async () => {
  if (!refreshToken) return log('Aucun refresh token.');
  try {
    const data = await request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    saveTokens({ jetonAcces: data.jetonAcces, jetonRefresh: data.jetonRefresh });
    log('Refresh ok');
  } catch (err) {
    log(`Erreur refresh (${err.status || '??'}): ${JSON.stringify(err.body)}`);
  }
});

// Déconnexion
 document.getElementById('btnLogout').addEventListener('click', async () => {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch (err) {
    log(`Info logout (${err.status || '??'}): ${JSON.stringify(err.body)}`);
  }
  clearTokens();
  log('Déconnecté');
});

// Profil
 document.getElementById('btnMe').addEventListener('click', async () => {
  try {
    const data = await request('/auth/me');
    document.getElementById('meOutput').textContent = JSON.stringify(data, null, 2);
    log('Profil chargé');
  } catch (err) {
    document.getElementById('meOutput').textContent = 'Erreur';
    log(`Erreur profil (${err.status || '??'}): ${JSON.stringify(err.body)}`);
  }
});

// Update profil
 document.getElementById('formProfile').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = serializeForm(e.target);
  Object.keys(payload).forEach((k) => payload[k] === '' && delete payload[k]);
  try {
    const data = await request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) });
    log(`Profil mis à jour: ${JSON.stringify(data.utilisateur || data)}`);
  } catch (err) {
    log(`Erreur update profil (${err.status || '??'}): ${JSON.stringify(err.body)}`);
  }
});

// Changer mot de passe
 document.getElementById('formPassword').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = serializeForm(e.target);
  try {
    await request('/users/me/password', { method: 'PATCH', body: JSON.stringify(payload) });
    log('Mot de passe changé');
  } catch (err) {
    log(`Erreur changement mot de passe (${err.status || '??'}): ${JSON.stringify(err.body)}`);
  }
});

// Lister bloqués
 document.getElementById('btnBlocked').addEventListener('click', async () => {
  try {
    const data = await request('/users/blocked');
    document.getElementById('blockedOutput').textContent = JSON.stringify(data.utilisateurs || data, null, 2);
    log('Liste bloqués chargée');
  } catch (err) {
    document.getElementById('blockedOutput').textContent = 'Erreur';
    log(`Erreur liste bloqués (${err.status || '??'}): ${JSON.stringify(err.body)}`);
  }
});

// Débloquer
 document.getElementById('formUnblock').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = serializeForm(e.target);
  const id = payload.id_utilisateur;
  try {
    await request(`/users/${id}/unblock`, { method: 'POST' });
    log(`Utilisateur ${id} débloqué`);
  } catch (err) {
    log(`Erreur déblocage (${err.status || '??'}): ${JSON.stringify(err.body)}`);
  }
});

// UI actions

document.getElementById('setApi').addEventListener('click', () => {
  setApiBase(apiInput.value.trim());
});

document.getElementById('btnClearLog').addEventListener('click', () => {
  logBox.textContent = '';
});

// Init tokens preview at load
updateTokenPreview();

// Load api param if provided
const paramApi = new URLSearchParams(window.location.search).get('api');
if (paramApi) setApiBase(paramApi);

log('Prêt. Utilisez les formulaires pour appeler l’API.');
