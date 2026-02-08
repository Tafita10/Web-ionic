<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Modifier le profil</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismiss">Fermer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <form @submit.prevent="handleSubmit">
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
          <ion-label position="floating">Téléphone</ion-label>
          <ion-input
            v-model="formData.telephone"
            type="tel"
            :disabled="loading"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Adresse</ion-label>
          <ion-textarea
            v-model="formData.adresse"
            :rows="3"
            :disabled="loading"
          ></ion-textarea>
        </ion-item>
      </ion-list>
      <ion-text v-if="errorMessage" color="danger" class="error-message">
        <p>{{ errorMessage }}</p>
      </ion-text>
      <ion-button
        expand="block"
        type="submit"
        :disabled="loading"
        class="submit-button"
      >
        <ion-spinner v-if="loading" name="crescent"></ion-spinner>
        <span v-else>Enregistrer</span>
      </ion-button>
    </form>
  </ion-content>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
  IonTextarea,
  IonText,
  IonSpinner,
  modalController,
  toastController
} from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';
import { SUCCESS_MESSAGES } from '@/config/constants';
import type { User } from '@/types';
interface Props {
  user: User | null;
}
const props = defineProps<Props>();
const authStore = useAuthStore();
const formData = ref({
  nom: '',
  prenom: '',
  telephone: '',
  adresse: ''
});
const loading = ref(false);
const errorMessage = ref('');
const dismiss = () => {
  modalController.dismiss();
};
const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.updateProfile(formData.value);
    const toast = await toastController.create({
      message: SUCCESS_MESSAGES.PROFILE_UPDATED,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    dismiss();
  } catch (error: any) {
    errorMessage.value = error.message || 'Erreur lors de la mise à jour';
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  if (props.user) {
    formData.value = {
      nom: props.user.nom,
      prenom: props.user.prenom,
      telephone: props.user.telephone || '',
      adresse: props.user.adresse || ''
    };
  }
});
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