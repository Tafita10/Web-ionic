#!/usr/bin/env node

/**
 * Script de test de configuration Firebase
 * Vérifie que tous les fichiers de configuration sont présents et valides
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration Firebase...\n');

const checks = [];

// 1. Vérifier le fichier de service account backend
const backendServiceAccountPath = path.join(__dirname, 'backend', 'src', 'config', 'firebase-service-account.json');
if (fs.existsSync(backendServiceAccountPath)) {
  try {
    const serviceAccount = require(backendServiceAccountPath);
    if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
      checks.push({ name: 'Backend Service Account', status: '✅', message: `Project ID: ${serviceAccount.project_id}` });
    } else {
      checks.push({ name: 'Backend Service Account', status: '⚠️', message: 'Fichier incomplet' });
    }
  } catch (error) {
    checks.push({ name: 'Backend Service Account', status: '❌', message: 'Erreur de lecture' });
  }
} else {
  checks.push({ name: 'Backend Service Account', status: '❌', message: 'Fichier manquant' });
}

// 2. Vérifier la configuration mobile
const mobileEnvPath = path.join(__dirname, 'mobile-app', 'src', 'environments', 'environment.ts');
if (fs.existsSync(mobileEnvPath)) {
  const envContent = fs.readFileSync(mobileEnvPath, 'utf-8');
  if (envContent.includes('VOTRE_API_KEY')) {
    checks.push({ name: 'Mobile App Config (Dev)', status: '⚠️', message: 'Configuration par défaut - à modifier' });
  } else if (envContent.includes('apiKey') && envContent.includes('projectId')) {
    checks.push({ name: 'Mobile App Config (Dev)', status: '✅', message: 'Configuration présente' });
  } else {
    checks.push({ name: 'Mobile App Config (Dev)', status: '❌', message: 'Configuration invalide' });
  }
} else {
  checks.push({ name: 'Mobile App Config (Dev)', status: '❌', message: 'Fichier manquant' });
}

// 3. Vérifier la configuration mobile production
const mobileEnvProdPath = path.join(__dirname, 'mobile-app', 'src', 'environments', 'environment.prod.ts');
if (fs.existsSync(mobileEnvProdPath)) {
  const envContent = fs.readFileSync(mobileEnvProdPath, 'utf-8');
  if (envContent.includes('VOTRE_API_KEY')) {
    checks.push({ name: 'Mobile App Config (Prod)', status: '⚠️', message: 'Configuration par défaut - à modifier' });
  } else if (envContent.includes('apiKey') && envContent.includes('projectId')) {
    checks.push({ name: 'Mobile App Config (Prod)', status: '✅', message: 'Configuration présente' });
  } else {
    checks.push({ name: 'Mobile App Config (Prod)', status: '❌', message: 'Configuration invalide' });
  }
} else {
  checks.push({ name: 'Mobile App Config (Prod)', status: '❌', message: 'Fichier manquant' });
}

// 4. Vérifier la configuration web
const webConfigPath = path.join(__dirname, 'web-app', 'src', 'config', 'firebase.js');
if (fs.existsSync(webConfigPath)) {
  const configContent = fs.readFileSync(webConfigPath, 'utf-8');
  if (configContent.includes('VOTRE_API_KEY')) {
    checks.push({ name: 'Web App Config', status: '⚠️', message: 'Configuration par défaut - à modifier' });
  } else if (configContent.includes('apiKey') && configContent.includes('projectId')) {
    checks.push({ name: 'Web App Config', status: '✅', message: 'Configuration présente' });
  } else {
    checks.push({ name: 'Web App Config', status: '❌', message: 'Configuration invalide' });
  }
} else {
  checks.push({ name: 'Web App Config', status: '❌', message: 'Fichier manquant' });
}

// 5. Vérifier les dépendances backend
const backendPackagePath = path.join(__dirname, 'backend', 'package.json');
if (fs.existsSync(backendPackagePath)) {
  const pkg = require(backendPackagePath);
  if (pkg.dependencies && pkg.dependencies['firebase-admin']) {
    checks.push({ name: 'Backend Dependencies', status: '✅', message: `firebase-admin: ${pkg.dependencies['firebase-admin']}` });
  } else {
    checks.push({ name: 'Backend Dependencies', status: '❌', message: 'firebase-admin manquant' });
  }
} else {
  checks.push({ name: 'Backend Dependencies', status: '❌', message: 'package.json manquant' });
}

// 6. Vérifier les dépendances mobile
const mobilePackagePath = path.join(__dirname, 'mobile-app', 'package.json');
if (fs.existsSync(mobilePackagePath)) {
  const pkg = require(mobilePackagePath);
  const hasFirebase = pkg.dependencies && (pkg.dependencies['firebase'] || pkg.dependencies['@angular/fire']);
  if (hasFirebase) {
    checks.push({ name: 'Mobile Dependencies', status: '✅', message: 'Firebase SDK présent' });
  } else {
    checks.push({ name: 'Mobile Dependencies', status: '⚠️', message: 'Firebase SDK non détecté' });
  }
} else {
  checks.push({ name: 'Mobile Dependencies', status: '❌', message: 'package.json manquant' });
}

// 7. Vérifier les dépendances web
const webPackagePath = path.join(__dirname, 'web-app', 'package.json');
if (fs.existsSync(webPackagePath)) {
  const pkg = require(webPackagePath);
  if (pkg.dependencies && pkg.dependencies['firebase']) {
    checks.push({ name: 'Web Dependencies', status: '✅', message: `firebase: ${pkg.dependencies['firebase']}` });
  } else {
    checks.push({ name: 'Web Dependencies', status: '⚠️', message: 'firebase manquant' });
  }
} else {
  checks.push({ name: 'Web Dependencies', status: '❌', message: 'package.json manquant' });
}

// Afficher les résultats
console.log('═══════════════════════════════════════════════════════════════');
checks.forEach(check => {
  console.log(`${check.status} ${check.name.padEnd(30)} │ ${check.message}`);
});
console.log('═══════════════════════════════════════════════════════════════\n');

// Résumé
const success = checks.filter(c => c.status === '✅').length;
const warnings = checks.filter(c => c.status === '⚠️').length;
const errors = checks.filter(c => c.status === '❌').length;

console.log(`📊 Résumé: ${success} ✅ | ${warnings} ⚠️ | ${errors} ❌\n`);

if (errors > 0) {
  console.log('❌ Action requise: Certains éléments de configuration sont manquants');
  console.log('📖 Consultez FIREBASE_CONFIG_GUIDE.md pour les instructions\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  Configuration par défaut détectée');
  console.log('📝 N\'oubliez pas de remplacer les valeurs par votre vraie configuration Firebase');
  console.log('📖 Consultez FIREBASE_CONFIG_GUIDE.md pour les instructions\n');
  process.exit(0);
} else {
  console.log('✅ Tous les fichiers de configuration sont présents et semblent valides');
  console.log('🚀 Vous pouvez maintenant démarrer votre application\n');
  process.exit(0);
}
