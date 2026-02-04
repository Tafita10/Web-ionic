/**
 * Tests de validation rapide - Fonctionnalités critiques seulement
 * Évite les problèmes de rate limiting
 */

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = options.headers || {};
  
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(url, { ...options, headers });
  let data;
  const text = await response.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  return { response, data, status: response.status };
}

async function runTests() {
  console.log('\n✓ Module Authentification - Tests Rapides\n');
  
  // TEST 1: Health
  const health = await request('/health');
  console.log(health.status === 200 ? '✓ Health Check' : '✗ Health Check');
  
  // TEST 2: Inscription
  const email = `test${Date.now()}@example.com`;
  const register = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom_complet: 'Test User',
      nom_utilisateur: `user${Date.now()}`,
      email,
      mot_de_passe: 'Password123'
    })
  });
  console.log(register.status === 201 ? '✓ Inscription' : '✗ Inscription');
  
  const token = register.data.jetonAcces;
  
  // TEST 3: Profil
  const profil = await request('/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(profil.status === 200 ? '✓ Consulter profil' : '✗ Consulter profil');
  
  // TEST 4: Modifier profil
  const update = await request('/users/me', {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ telephone: '+261340000000' })
  });
  console.log(update.status === 200 ? '✓ Modifier profil' : '✗ Modifier profil');
  
  // TEST 5: Connexion manager
  await new Promise(r => setTimeout(r, 1000));
  const manager = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifiant: 'manager@webrojo.mg',
      mot_de_passe: 'password123'
    })
  });
  console.log(manager.status === 200 ? '✓ Connexion Manager' : '✗ Connexion Manager');
  
  // TEST 6: Liste bloqués (Manager)
  if (manager.data.jetonAcces) {
    const blocked = await request('/users/blocked', {
      headers: { 'Authorization': `Bearer ${manager.data.jetonAcces}` }
    });
    console.log(blocked.status === 200 ? '✓ Lister utilisateurs bloqués' : '✗ Lister utilisateurs bloqués');
  }
  
  console.log('\n✓ Tests terminés\n');
}

runTests().catch(err => console.error('Erreur:', err.message));
