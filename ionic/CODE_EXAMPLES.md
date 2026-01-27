# 💡 Exemples de Code Firebase

Ce document contient des exemples de code pour utiliser Firebase dans votre application.

---

## 📱 Mobile App (Ionic/Angular)

### 1. Inscription d'un utilisateur

```typescript
// Dans votre composant register.page.ts
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html'
})
export class RegisterPage {
  email = '';
  password = '';
  displayName = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onRegister() {
    try {
      const user = await this.authService.register(
        this.email,
        this.password,
        this.displayName
      );
      console.log('✅ Utilisateur créé:', user);
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage = error.message;
      console.error('❌ Erreur inscription:', error);
    }
  }
}
```

### 2. Connexion d'un utilisateur

```typescript
// Dans votre composant login.page.ts
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html'
})
export class LoginPage {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    try {
      const user = await this.authService.login(this.email, this.password);
      console.log('✅ Connecté:', user);
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage = error.message;
      console.error('❌ Erreur connexion:', error);
    }
  }
}
```

### 3. Déconnexion

```typescript
// Dans n'importe quel composant
async onLogout() {
  try {
    await this.authService.logout();
    console.log('✅ Déconnecté');
    this.router.navigate(['/login']);
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
  }
}
```

### 4. Récupérer le profil utilisateur

```typescript
// Dans profile.page.ts
import { Component, OnInit } from '@angular/core';
import { AuthService, UserProfile } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html'
})
export class ProfilePage implements OnInit {
  user: UserProfile | null = null;
  loading = true;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    try {
      this.user = await this.authService.getCurrentUserProfile();
      console.log('👤 Profil:', this.user);
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
    } finally {
      this.loading = false;
    }
  }
}
```

### 5. Écouter les changements d'authentification

```typescript
// Dans app.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // S'abonner aux changements d'authentification
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('👤 Utilisateur connecté:', user.email);
        // L'utilisateur est connecté
      } else {
        console.log('👋 Utilisateur déconnecté');
        // L'utilisateur n'est pas connecté
        this.router.navigate(['/login']);
      }
    });
  }
}
```

### 6. Vérifier si l'utilisateur est connecté (Guard)

```typescript
// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const user = await this.authService.getCurrentUser();
    
    if (user) {
      return true; // Autoriser l'accès
    } else {
      this.router.navigate(['/login']);
      return false; // Bloquer l'accès
    }
  }
}
```

**Utilisation dans les routes :**

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module') },
  { 
    path: 'home', 
    loadChildren: () => import('./home/home.module'),
    canActivate: [AuthGuard] // ← Protégé par le guard
  },
  { 
    path: 'profile', 
    loadChildren: () => import('./profile/profile.module'),
    canActivate: [AuthGuard] // ← Protégé par le guard
  }
];
```

---

## 🌐 Web App (React)

### 1. Inscription d'un utilisateur

```javascript
// Register.jsx
import React, { useState } from 'react';
import { register } from '../services/authService';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await register(email, password, displayName);
      console.log('✅ Utilisateur créé:', user);
      navigate('/home');
    } catch (error) {
      setError(error.message);
      console.error('❌ Erreur inscription:', error);
    }
  };

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">S'inscrire</button>
        {error && <p style={{color: 'red'}}>{error}</p>}
      </form>
    </div>
  );
}

export default Register;
```

### 2. Connexion d'un utilisateur

```javascript
// Login.jsx
import React, { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(email, password);
      console.log('✅ Connecté:', user);
      navigate('/home');
    } catch (error) {
      setError(error.message);
      console.error('❌ Erreur connexion:', error);
    }
  };

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
        {error && <p style={{color: 'red'}}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;
```

### 3. Context pour gérer l'authentification

```javascript
// AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouter les changements d'authentification
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      console.log('👤 Auth state changed:', user ? user.email : 'logged out');
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

**Utilisation dans App.jsx :**

```javascript
// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### 4. Route protégée

```javascript
// PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
```

### 5. Profil utilisateur

```javascript
// Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/authService';

function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile(currentUser.uid);
      setProfile(data);
      setDisplayName(data.displayName || '');
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await updateUserProfile({ displayName });
      console.log('✅ Profil mis à jour');
      await loadProfile();
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Mon Profil</h2>
      <p>Email: {profile?.email}</p>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Nom"
        />
        <button type="submit">Mettre à jour</button>
      </form>
    </div>
  );
}

export default Profile;
```

---

## 🔧 Backend (Node.js)

### 1. Vérifier un token Firebase

```javascript
// authMiddleware.js
const { getAuth } = require('./config/firebase');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    // Vérifier le token avec Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('❌ Erreur vérification token:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = { verifyFirebaseToken };
```

### 2. Créer un custom token

```javascript
// authController.js
const { getAuth } = require('../config/firebase');

const createCustomToken = async (req, res) => {
  try {
    const { uid } = req.body;
    
    // Créer un custom token pour l'utilisateur
    const customToken = await getAuth().createCustomToken(uid);
    
    res.json({ customToken });
  } catch (error) {
    console.error('❌ Erreur création token:', error);
    res.status(500).json({ message: 'Erreur création token' });
  }
};

module.exports = { createCustomToken };
```

### 3. Route protégée avec middleware

```javascript
// userRoutes.js
const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/userController');

// Route protégée - nécessite un token valide
router.get('/profile', verifyFirebaseToken, getProfile);
router.put('/profile', verifyFirebaseToken, updateProfile);

module.exports = router;
```

---

## 🎯 Exemples Pratiques

### Formulaire d'inscription avec validation

```typescript
// register.page.ts (Ionic)
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html'
})
export class RegisterPage {
  registerForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { email, password, displayName } = this.registerForm.value;
      await this.authService.register(email, password, displayName);
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.loading = false;
    }
  }
}
```

---

## 📚 Documentation Complète

Pour plus d'exemples et d'informations :
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Ionic Docs](https://ionicframework.com/docs)
- [React Docs](https://react.dev/)

---

**Besoin d'aide ?** Consultez :
- [QUICK_START_FIREBASE.md](QUICK_START_FIREBASE.md)
- [FIREBASE_CONFIG_GUIDE.md](FIREBASE_CONFIG_GUIDE.md)
- [ARCHITECTURE_FIREBASE.md](ARCHITECTURE_FIREBASE.md)
