<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/signalements"></ion-back-button>
        </ion-buttons>
        <ion-title>Nouveau signalement</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <form @submit.prevent="handleSubmit">
        <div class="photos-section">
          <ion-list-header>
            <ion-label>Photos ({{ photosPreview.length }}/5)</ion-label>
          </ion-list-header>
          <div v-if="photosPreview.length > 0" class="photos-grid">
            <div
              v-for="(photo, index) in photosPreview"
              :key="index"
              class="photo-preview-item"
            >
              <img :src="photo" :alt="`Photo ${index + 1}`" />
              <ion-button
                fill="clear"
                color="danger"
                class="remove-photo-btn"
                @click="removePhoto(index)"
              >
                <ion-icon :icon="closeCircleOutline"></ion-icon>
              </ion-button>
            </div>
          </div>
          <div class="photo-buttons">
            <ion-button
              expand="block"
              @click="takePhoto"
              :disabled="loading || photosPreview.length >= 5"
            >
              <ion-icon :icon="cameraOutline" slot="start"></ion-icon>
              Prendre une photo
            </ion-button>
            <ion-button
              v-if="photosPreview.length > 0"
              expand="block"
              fill="outline"
              @click="clearAllPhotos"
              :disabled="loading"
            >
              <ion-icon :icon="trashOutline" slot="start"></ion-icon>
              Supprimer toutes les photos
            </ion-button>
          </div>
          <ion-text color="medium" class="photo-hint">
            <p>Vous pouvez prendre jusqu'à 5 photos pour illustrer le problème</p>
          </ion-text>
        </div>
        <ion-list>
          <ion-list-header>
            <ion-label>Localisation</ion-label>
          </ion-list-header>
          <ion-item>
            <ion-label position="stacked">Latitude</ion-label>
            <ion-note slot="end">{{ formData.latitude?.toFixed(6) || 'Non définie' }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Longitude</ion-label>
            <ion-note slot="end">{{ formData.longitude?.toFixed(6) || 'Non définie' }}</ion-note>
          </ion-item>
          <ion-item button @click="getCurrentPosition" :disabled="locationLoading">
            <ion-icon :icon="locateOutline" slot="start"></ion-icon>
            <ion-label>
              <h3>Utiliser ma position actuelle</h3>
            </ion-label>
            <ion-spinner v-if="locationLoading" slot="end"></ion-spinner>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Adresse précise (optionnel)</ion-label>
            <textarea
              v-model="formData.adresse_precise"
              class="native-textarea"
              placeholder="Ex: Devant l'Hôtel de Ville"
              rows="2"
              :disabled="loading"
            ></textarea>
          </ion-item>
        </ion-list>
        <ion-list>
          <ion-list-header>
            <ion-label>Informations du signalement</ion-label>
          </ion-list-header>
          <ion-item>
            <ion-label position="stacked">Titre *</ion-label>
            <input
              v-model="formData.titre"
              class="native-input"
              type="text"
              placeholder="Ex: Nid de poule dangereux"
              required
              :disabled="loading"
              maxlength="100"
            />
          </ion-item>
          <ion-item>
            <ion-label>Type de problème *</ion-label>
            <ion-select :value="formData.type" @ionChange="formData.type = $event.detail.value" :disabled="loading" placeholder="Sélectionner">
              <ion-select-option value="nid-de-poule">Nid de poule</ion-select-option>
              <ion-select-option value="fissure">Fissure</ion-select-option>
              <ion-select-option value="debris">Débris</ion-select-option>
              <ion-select-option value="autre">Autre</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label>Gravité *</ion-label>
            <ion-select :value="formData.gravite" @ionChange="formData.gravite = $event.detail.value" :disabled="loading" placeholder="Sélectionner">
              <ion-select-option value="faible">Faible</ion-select-option>
              <ion-select-option value="moyenne">Moyenne</ion-select-option>
              <ion-select-option value="elevee">Élevée</ion-select-option>
              <ion-select-option value="critique">Critique</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Description *</ion-label>
            <textarea
              v-model="formData.description"
              class="native-textarea"
              placeholder="Décrivez le problème rencontré..."
              rows="4"
              required
              :disabled="loading"
              maxlength="1000"
            ></textarea>
            <ion-note slot="helper">{{ formData.description?.length || 0 }}/1000</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Priorité</ion-label>
            <ion-select :value="formData.priorite" @ionChange="formData.priorite = $event.detail.value" :disabled="loading">
              <ion-select-option
                v-for="level in prioriteLevels"
                :key="level.value"
                :value="level.value"
              >
                {{ level.label }}
              </ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>
        <ion-text v-if="validationError" color="danger" class="error-message">
          <p>{{ validationError }}</p>
        </ion-text>
        <ion-text v-if="!isFormValid && !loading" color="warning" class="validation-help">
          <p v-if="formData.latitude === 0 || formData.longitude === 0">
            📍 Veuillez d'abord obtenir votre position (bouton GPS)
          </p>
          <p v-else-if="!formData.titre || formData.titre.length < 5">
            📝 Le titre doit contenir au moins 5 caractères
          </p>
          <p v-else-if="!formData.type">
            🏷️ Veuillez sélectionner un type de problème
          </p>
          <p v-else-if="!formData.gravite">
            ⚠️ Veuillez sélectionner la gravité
          </p>
          <p v-else-if="formData.description.length < 10">
            📝 La description doit contenir au moins 10 caractères
          </p>
        </ion-text>
        <div class="button-group">
          <button
            type="submit"
            class="submit-button"
            :class="{ 'button-disabled': loading || !isFormValid }"
            @click.prevent="handleSubmit"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Créer le signalement</span>
          </button>
          <button
            type="button"
            class="cancel-button"
            :class="{ 'button-disabled': loading }"
            @click="handleCancel"
          >
            Annuler
          </button>
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
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonNote,
  toastController,
  loadingController
} from '@ionic/vue';
import {
  cameraOutline,
  closeCircleOutline,
  locateOutline,
  trashOutline
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { useSignalementStore } from '@/stores/signalement.firebase';
import {
  PRIORITE_LEVELS,
  VALIDATION_RULES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  GEOLOCATION_OPTIONS
} from '@/config/constants';
import type { SignalementCreate, SignalementType, SignalementGravite } from '@/types';
const router = useRouter();
const route = useRoute();
const signalementStore = useSignalementStore();
const formData = ref<SignalementCreate>({
  titre: '',
  description: '',
  type: 'nid-de-poule' as SignalementType,
  gravite: 'moyenne' as SignalementGravite,
  latitude: 0,
  longitude: 0,
  adresse_precise: '',
  priorite: 3
});
const photosPreview = ref<string[]>([]);
const photosBase64 = ref<string[]>([]);
const loading = ref(false);
const locationLoading = ref(false);
const validationError = ref('');
const prioriteLevels = PRIORITE_LEVELS;
const isFormValid = computed(() => {
  return (
    formData.value.latitude !== 0 &&
    formData.value.longitude !== 0 &&
    formData.value.titre && formData.value.titre.length >= 5 &&
    formData.value.type &&
    formData.value.gravite &&
    formData.value.description.length >= VALIDATION_RULES.DESCRIPTION_MIN_LENGTH &&
    formData.value.description.length <= VALIDATION_RULES.DESCRIPTION_MAX_LENGTH
  );
});
const takePhoto = async () => {
  if (photosPreview.value.length >= 5) {
    const toast = await toastController.create({
      message: 'Vous ne pouvez prendre que 5 photos maximum',
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    return;
  }
  try {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      width: 800,
      height: 600
    });
    if (image.base64String) {
      photosBase64.value.push(image.base64String);
      photosPreview.value.push(`data:image/jpeg;base64,${image.base64String}`);
      const toast = await toastController.create({
        message: `Photo ${photosPreview.value.length} ajoutée`,
        duration: 1500,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    }
  } catch (error: any) {
    if (error.message !== 'User cancelled photos app') {
      const toast = await toastController.create({
        message: ERROR_MESSAGES.CAMERA_ERROR,
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }
};
const removePhoto = (index: number) => {
  photosBase64.value.splice(index, 1);
  photosPreview.value.splice(index, 1);
};
const clearAllPhotos = () => {
  photosBase64.value = [];
  photosPreview.value = [];
};
const getCurrentPosition = async () => {
  locationLoading.value = true;
  try {
    const position = await Geolocation.getCurrentPosition(GEOLOCATION_OPTIONS);
    formData.value.latitude = position.coords.latitude;
    formData.value.longitude = position.coords.longitude;
    const toast = await toastController.create({
      message: 'Position obtenue avec succès',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  } catch (error: any) {
    console.warn('Géolocalisation non disponible:', error?.message || error);
    formData.value.latitude = -18.8792;
    formData.value.longitude = 47.5079;
    let message = 'Position par défaut utilisée (Antananarivo)';
    if (error?.code === 1) {
      message = 'Autorisation de localisation refusée. Vérifiez les paramètres de votre appareil.';
    } else if (error?.code === 2) {
      message = 'Position GPS indisponible. Assurez-vous que le GPS est activé.';
    } else if (error?.code === 3) {
      message = 'Délai dépassé pour obtenir la position GPS.';
    }
    const toast = await toastController.create({
      message,
      duration: 5000,
      color: 'warning',
      position: 'top',
      buttons: [{
        text: 'Paramètres',
        handler: () => {
          window.open('app-settings:', '_system');
        }
      }]
    });
    await toast.present();
  } finally {
    locationLoading.value = false;
  }
};
const handleSubmit = async () => {
  validationError.value = '';
  if (!isFormValid.value) {
    validationError.value = 'Veuillez remplir tous les champs obligatoires';
    return;
  }
  const loadingEl = await loadingController.create({
    message: 'Création du signalement...'
  });
  await loadingEl.present();
  loading.value = true;
  try {
    const signalement = await signalementStore.createSignalement(formData.value);
    if (photosBase64.value.length > 0 && signalement.id) {
      try {
        const photoUrls = await signalementStore.uploadMultiplePhotos(
          signalement.id,
          photosBase64.value
        );
        console.log(`${photoUrls.length} photos uploaded:`, photoUrls);
      } catch (photoError) {
        console.error('Error uploading photos:', photoError);
        const toast = await toastController.create({
          message: 'Signalement créé mais erreur lors de l\'upload des photos',
          duration: 3000,
          color: 'warning',
          position: 'top'
        });
        await toast.present();
      }
    }
    await loadingEl.dismiss();
    const toast = await toastController.create({
      message: SUCCESS_MESSAGES.SIGNALEMENT_CREATED,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    router.replace(`/signalements/${signalement.id}`);
  } catch (error: any) {
    await loadingEl.dismiss();
    validationError.value = error.message || 'Erreur lors de la création du signalement';
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
  if (route.query.lat && route.query.lng) {
    formData.value.latitude = parseFloat(route.query.lat as string);
    formData.value.longitude = parseFloat(route.query.lng as string);
  } else {
    getCurrentPosition();
  }
});
</script>
<style scoped>
.photos-section {
  margin-bottom: 24px;
}
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.photo-preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: var(--ion-color-light);
}
.photo-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.remove-photo-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  --background: rgba(0, 0, 0, 0.6);
  --border-radius: 50%;
  --size: 32px;
  width: 32px;
  height: 32px;
}
.photo-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.photo-hint {
  display: block;
  text-align: center;
  font-size: 12px;
  margin-top: 8px;
}
.photo-hint p {
  margin: 0;
}
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
.validation-help {
  display: block;
  text-align: center;
  margin: 16px 0;
  padding: 12px;
  background: var(--ion-color-warning-tint);
  border-radius: 8px;
}
.validation-help p {
  margin: 0;
  font-size: 14px;
}
.button-group {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.native-input,
.native-textarea {
  width: 100%;
  padding: 10px 0;
  border: none;
  background: transparent;
  font-size: 16px;
  color: var(--ion-text-color);
  outline: none;
  font-family: inherit;
}
.native-input::placeholder,
.native-textarea::placeholder {
  color: var(--ion-color-medium);
}
.native-input:disabled,
.native-textarea:disabled {
  opacity: 0.5;
}
.native-textarea {
  resize: none;
  min-height: 60px;
}
.submit-button,
.cancel-button {
  width: 100%;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.submit-button {
  background: var(--ion-color-primary, #3880ff);
  color: white;
  border: none;
}
.submit-button:hover:not(.button-disabled) {
  background: var(--ion-color-primary-shade, #3171e0);
}
.cancel-button {
  background: transparent;
  color: var(--ion-color-primary, #3880ff);
  border: 2px solid var(--ion-color-primary, #3880ff);
}
.cancel-button:hover:not(.button-disabled) {
  background: rgba(56, 128, 255, 0.1);
}
.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>