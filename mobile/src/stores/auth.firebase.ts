import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import FirebaseService from '@/services/firebase.service';
import ApiService from '@/services/api.service';
import { StorageService } from '@/services/storage.service';
import type { User } from '@/types';
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isOnline = ref(true);
  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value ? `${user.value.prenom} ${user.value.nom}` : '');
  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      isOnline.value = await FirebaseService.checkOnlineStatus();
      if (isOnline.value && FirebaseService.isInitialized()) {
        const firebaseUser = await FirebaseService.login(email, password);
        const idToken = await firebaseUser.getIdToken();
        token.value = idToken;
        user.value = {
          id: firebaseUser.uid as any,
          email: firebaseUser.email || email,
          nom: firebaseUser.displayName?.split(' ')[0] || 'Utilisateur',
          prenom: firebaseUser.displayName?.split(' ')[1] || '',
          telephone: firebaseUser.phoneNumber || '',
          role_id: 2,
          is_active: true,
          created_at: new Date(),
          firebase_uid: firebaseUser.uid
        };
        await StorageService.set('auth_token', idToken);
        await StorageService.set('user', user.value);
        await StorageService.set('auth_mode', 'firebase');
      } else {
        const response = await ApiService.post('/auth/login', { email, password });
        token.value = response.data.token;
        user.value = response.data.user;
        await StorageService.set('auth_token', response.data.token);
        await StorageService.set('user', response.data.user);
        await StorageService.set('auth_mode', 'local');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur de connexion';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }
  async function logout() {
    loading.value = true;
    try {
      const authMode = await StorageService.get('auth_mode');
      if (authMode === 'firebase') {
        await FirebaseService.logout();
      } else {
        try {
          await ApiService.post('/auth/logout');
        } catch (err) {
          console.error('Erreur logout API:', err);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      user.value = null;
      token.value = null;
      await StorageService.remove('auth_token');
      await StorageService.remove('user');
      await StorageService.remove('auth_mode');
      loading.value = false;
    }
  }
  async function restoreSession() {
    const savedToken = await StorageService.get('auth_token');
    const savedUser = await StorageService.get('user');
    const authMode = await StorageService.get('auth_mode');
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = typeof savedUser === 'string' ? JSON.parse(savedUser) : savedUser;
      if (authMode === 'firebase') {
        isOnline.value = await FirebaseService.checkOnlineStatus();
        if (isOnline.value) {
          try {
            const currentUser = FirebaseService.getCurrentUser();
            if (!currentUser) {
              await logout();
            }
          } catch (err) {
            await logout();
          }
        }
      }
    }
  }
  async function checkOnlineStatus() {
    isOnline.value = await FirebaseService.checkOnlineStatus();
    return isOnline.value;
  }
  return {
    user,
    token,
    loading,
    error,
    isOnline,
    isAuthenticated,
    userName,
    login,
    logout,
    restoreSession,
    checkOnlineStatus
  };
}, {
  persist: {
    paths: ['user', 'token']
  }
});