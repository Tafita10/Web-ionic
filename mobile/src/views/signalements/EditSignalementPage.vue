<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/signalements/${route.params.id}`"></ion-back-button>
        </ion-buttons>
        <ion-title>Modifier le signalement</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <form @submit.prevent="handleSubmit">
        <ion-list>
          <ion-list-header>
            <ion-label>Description</ion-label>
          </ion-list-header>
          <ion-item>
            <ion-label position="stacked">Description *</ion-label>
            <ion-textarea
              v-model="formData.description"
              placeholder="Décrivez le problème..."
              :rows="4"
              required
              :disabled="loading"
              :counter="true"
              :maxlength="1000"
            ></ion-textarea>
          </ion-item>
          <ion-item>
            <ion-label>Priorité</ion-label>
            <ion-select v-model="formData.priorite" :disabled="loading">
              <ion-select-option
                v-for="level in prioriteLevels"
                :key="level.value"
                :value="level.value"
              >
                {{ level.label }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Adresse précise</ion-label>
            <ion-textarea
              v-model="formData.adresse_precise"
              placeholder="Ex: Devant l'Hôtel de Ville"
              :rows="2"
              :disabled="loading"
            ></ion-textarea>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Commentaire</ion-label>
            <ion-textarea
              v-model="formData.commentaire"
              placeholder="Commentaire additionnel..."
              :rows="3"
              :disabled="loading"
            ></ion-textarea>
          </ion-item>
        </ion-list>
        <ion-text v-if="validationError" color="danger" class="error-message">
          <p>{{ validationError }}</p>
        </ion-text>
        <div class="button-group">
          <ion-button
            expand="block"
            type="submit"
            :disabled="loading || !isFormValid"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Enregistrer les modifications</span>
          </ion-button>
          <ion-button
            expand="block"
            fill="outline"
            @click="handleCancel"
            :disabled="loading"
          >
            Annuler
          </ion-button>
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
  IonSpinner,
  toastController,
  loadingController
} from '@ionic/vue';
import { useSignalementStore } from '@/stores/signalement.firebase';
import { PRIORITE_LEVELS, VALIDATION_RULES, SUCCESS_MESSAGES } from '@/config/constants';

const router = useRouter();
const route = useRoute();
const signalementStore = useSignalementStore();
const formData = ref({
  description: '',
  priorite: 3,
  adresse_precise: '',
  commentaire: ''
});
const loading = ref(false);
const validationError = ref('');
const prioriteLevels = PRIORITE_LEVELS;
const isFormValid = computed(() => {
  return (
    formData.value.description.length >= VALIDATION_RULES.DESCRIPTION_MIN_LENGTH &&
    formData.value.description.length <= VALIDATION_RULES.DESCRIPTION_MAX_LENGTH
  );
});
const loadSignalement = async () => {
  const id = parseInt(route.params.id as string);
  if (isNaN(id)) {
    router.replace('/tabs/signalements');
    return;
  }
  try {
    await signalementStore.fetchSignalementById(id);
    const signalement = signalementStore.currentSignalement;
    if (signalement) {
      formData.value = {
        description: signalement.description,
        priorite: signalement.priorite,
        adresse_precise: signalement.adresse_precise || '',
        commentaire: signalement.commentaire || ''
      };
    }
  } catch (error) {
    console.error('Error loading signalement:', error);
    router.replace('/tabs/signalements');
  }
};
const handleSubmit = async () => {
  validationError.value = '';
  if (!isFormValid.value) {
    validationError.value = 'Veuillez remplir tous les champs obligatoires';
    return;
  }
  const loadingEl = await loadingController.create({
    message: 'Mise à jour en cours...'
  });
  await loadingEl.present();
  loading.value = true;
  try {
    const id = parseInt(route.params.id as string);
    await signalementStore.updateSignalement(id, formData.value);
    await loadingEl.dismiss();
    const toast = await toastController.create({
      message: SUCCESS_MESSAGES.SIGNALEMENT_UPDATED,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    router.back();
  } catch (error: any) {
    await loadingEl.dismiss();
    validationError.value = error.message || 'Erreur lors de la mise à jour';
    const toast = await toastController.create({
      message: validationError.value,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};
const handleCancel = () => {
  router.back();
};
onMounted(() => {
  loadSignalement();
});
</script>
<style scoped>
ion-list {
  margin-bottom: 24px;
}
ion-list-header {
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
  margin-bottom: 8px;
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
.button-group {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>