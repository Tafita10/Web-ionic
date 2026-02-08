<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Inscription</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="register-container">
        <form @submit.prevent="handleRegister">
          <ion-list>
            <ion-item>
              <ion-label position="floating">Nom</ion-label>
              <ion-input
                v-model="formData.nom"
                type="text"
                required
                :disabled="loading"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Prénom</ion-label>
              <ion-input
                v-model="formData.prenom"
                type="text"
                required
                :disabled="loading"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input
                v-model="formData.email"
                type="email"
                required
                autocomplete="email"
                :disabled="loading"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Téléphone</ion-label>
              <ion-input
                v-model="formData.telephone"
                type="tel"
                placeholder="+261 32 00 000 00"
                :disabled="loading"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Adresse</ion-label>
              <ion-textarea
                v-model="formData.adresse"
                :rows="2"
                :disabled="loading"
              ></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Mot de passe</ion-label>
              <ion-input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                :disabled="loading"
              ></ion-input>
              <ion-button
                slot="end"
                fill="clear"
                @click="showPassword = !showPassword"
              >
                <ion-icon
                  :icon="showPassword ? eyeOffOutline : eyeOutline"
                ></ion-icon>
              </ion-button>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Confirmer le mot de passe</ion-label>
              <ion-input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                :disabled="loading"
              ></ion-input>
            </ion-item>
          </ion-list>
          <ion-text v-if="validationError" color="danger" class="error-message">
            <p>{{ validationError }}</p>
          </ion-text>
          <ion-text v-if="errorMessage" color="danger" class="error-message">
            <p>{{ errorMessage }}</p>
          </ion-text>
          <ion-button
            expand="block"
            type="submit"
            :disabled="loading || !isFormValid"
            class="register-button"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>S'inscrire</span>
          </ion-button>
        </form>
        <div class="login-link">
          <ion-text color="medium">
            Déjà un compte ?
          </ion-text>
          <ion-button fill="clear" router-link="/login" :disabled="loading">
            Se connecter
          </ion-button>
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
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  toastController
} from '@ionic/vue';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { VALIDATION_RULES, SUCCESS_MESSAGES } from '@/config/constants';
import type { RegisterData } from '@/types';
const router = useRouter();
const authStore = useAuthStore();
const formData = ref<RegisterData>({
  email: '',
  password: '',
  nom: '',
  prenom: '',
  telephone: '',
  adresse: ''
});
const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const validationError = computed(() => {
  if (!formData.value.email) return '';
  if (!VALIDATION_RULES.EMAIL_PATTERN.test(formData.value.email)) {
    return 'Email invalide';
  }
  if (!formData.value.password) return '';
  if (formData.value.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caractères`;
  }
  if (confirmPassword.value && formData.value.password !== confirmPassword.value) {
    return 'Les mots de passe ne correspondent pas';
  }
  if (formData.value.telephone && !VALIDATION_RULES.PHONE_PATTERN.test(formData.value.telephone)) {
    return 'Numéro de téléphone invalide (format: +261 32 00 000 00)';
  }
  return '';
});
const isFormValid = computed(() => {
  return formData.value.email.trim() !== '' &&
         formData.value.password.trim() !== '' &&
         formData.value.nom.trim() !== '' &&
         formData.value.prenom.trim() !== '' &&
         formData.value.password === confirmPassword.value &&
         !validationError.value;
});
const handleRegister = async () => {
  if (!isFormValid.value) return;
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.register(formData.value);
    const toast = await toastController.create({
      message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Erreur lors de l\'inscription';
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
.register-container {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 20px;
}
ion-list {
  background: transparent;
  margin-bottom: 16px;
}
ion-item {
  --background: transparent;
  --border-radius: 12px;
  margin-bottom: 12px;
}
.error-message {
  display: block;
  text-align: center;
  margin: 16px 0;
}
.error-message p {
  margin: 0;
  font-size: 14px;
}
.register-button {
  margin-top: 24px;
  --border-radius: 12px;
  height: 48px;
  font-weight: bold;
}
.login-link {
  text-align: center;
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>