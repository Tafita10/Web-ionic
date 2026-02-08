<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Changer le mot de passe</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismiss">Fermer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <form @submit.prevent="handleSubmit">
      <ion-list>
        <ion-item>
          <ion-label position="floating">Mot de passe actuel</ion-label>
          <ion-input
            v-model="formData.oldPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            :disabled="loading"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Nouveau mot de passe</ion-label>
          <ion-input
            v-model="formData.newPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            :disabled="loading"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Confirmer le nouveau mot de passe</ion-label>
          <ion-input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            :disabled="loading"
          ></ion-input>
        </ion-item>
        <ion-item lines="none">
          <ion-checkbox v-model="showPassword" slot="start"></ion-checkbox>
          <ion-label>Afficher les mots de passe</ion-label>
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
        class="submit-button"
      >
        <ion-spinner v-if="loading" name="crescent"></ion-spinner>
        <span v-else>Changer le mot de passe</span>
      </ion-button>
    </form>
  </ion-content>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonCheckbox,
  IonText,
  IonSpinner,
  modalController,
  toastController
} from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';
import { VALIDATION_RULES } from '@/config/constants';
const authStore = useAuthStore();
const formData = ref({
  oldPassword: '',
  newPassword: ''
});
const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const validationError = computed(() => {
  if (!formData.value.newPassword) return '';
  if (formData.value.newPassword.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caractères`;
  }
  if (confirmPassword.value && formData.value.newPassword !== confirmPassword.value) {
    return 'Les mots de passe ne correspondent pas';
  }
  return '';
});
const isFormValid = computed(() => {
  return (
    formData.value.oldPassword.trim() !== '' &&
    formData.value.newPassword.trim() !== '' &&
    formData.value.newPassword === confirmPassword.value &&
    !validationError.value
  );
});
const dismiss = () => {
  modalController.dismiss();
};
const handleSubmit = async () => {
  if (!isFormValid.value) return;
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.changePassword(formData.value.oldPassword, formData.value.newPassword);
    const toast = await toastController.create({
      message: 'Mot de passe modifié avec succès',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    dismiss();
  } catch (error: any) {
    errorMessage.value = error.message || 'Erreur lors du changement de mot de passe';
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
ion-list {
  margin-bottom: 16px;
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
.submit-button {
  margin-top: 16px;
}
</style>