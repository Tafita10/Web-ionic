<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <div class="header-section">
          <ion-icon :icon="locationOutline" class="app-icon"></ion-icon>
          <h1>Signalement Route</h1>
          <p class="subtitle">Madagascar</p>
        </div>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              placeholder="Entrez votre email"
              required
              autocomplete="email"
              :disabled="loading"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <div class="password-container">
              <input
                id="password"
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Entrez votre mot de passe"
                required
                autocomplete="current-password"
                :disabled="loading"
                class="form-input"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                <ion-icon
                  :icon="showPassword ? eyeOffOutline : eyeOutline"
                ></ion-icon>
              </button>
            </div>
          </div>
          <div v-if="errorMessage" class="error-message">
            <p>{{ errorMessage }}</p>
          </div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="login-button"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Se connecter</span>
          </button>
        </form>
        <div class="register-info">
          <ion-text color="medium">
            <p>L'inscription se fait uniquement via l'application web par un manager.</p>
          </ion-text>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonText,
  IonSpinner,
  toastController
} from '@ionic/vue';
import { locationOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { SUCCESS_MESSAGES } from '@/config/constants';
const router = useRouter();
const authStore = useAuthStore();
const credentials = ref({
  email: '',
  password: ''
});
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const isFormValid = computed(() => {
  return credentials.value.email.trim() !== '' &&
         credentials.value.password.trim() !== '';
});
const handleLogin = async () => {
  if (!isFormValid.value) return;
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(credentials.value);
    const toast = await toastController.create({
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    router.push('/tabs/home');
  } catch (error: any) {
    errorMessage.value = error.message || 'Erreur lors de la connexion';
    const toast = await toastController.create({
      message: errorMessage.value,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 60px;
}
.header-section {
  text-align: center;
  margin-bottom: 40px;
}
.app-icon {
  font-size: 80px;
  color: var(--ion-color-primary);
  margin-bottom: 16px;
}
h1 {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  color: var(--ion-color-dark);
}
.subtitle {
  font-size: 16px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--ion-color-dark);
  font-size: 14px;
}
.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--ion-color-medium);
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.3s;
  background-color: transparent;
  color: var(--ion-color-dark);
}
.form-input:focus {
  outline: none;
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
}
.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.password-container {
  position: relative;
  display: flex;
  align-items: center;
}
.password-container .form-input {
  margin-bottom: 0;
}
.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--ion-color-medium);
  display: flex;
  align-items: center;
  justify-content: center;
}
.password-toggle:hover {
  color: var(--ion-color-primary);
}
.error-message {
  background-color: rgba(255, 59, 48, 0.1);
  border: 1px solid rgb(255, 59, 48);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  margin: 16px 0;
}
.error-message p {
  margin: 0;
  font-size: 14px;
  color: rgb(255, 59, 48);
}
.login-button {
  width: 100%;
  padding: 14px;
  margin-top: 24px;
  background-color: var(--ion-color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.login-button:hover:not(:disabled) {
  background-color: var(--ion-color-primary-shade);
}
.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
ion-spinner {
  width: 20px;
  height: 20px;
}
.register-info {
  text-align: center;
  margin-top: 32px;
  padding: 16px;
}
.register-info p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}
</style>