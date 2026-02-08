<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/signalements"></ion-back-button>
        </ion-buttons>
        <ion-title>Détails du signalement</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openMenu">
            <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>
      <div v-else-if="signalement" class="detail-container">
        <div v-if="hasPhotos" class="photos-section">
          <div class="photo-container">
            <img :src="mainPhoto" alt="Photo du signalement" />
            <div v-if="totalPhotos > 1" class="photos-overlay">
              <ion-chip class="photos-count">
                <ion-icon :icon="imagesOutline"></ion-icon>
                <ion-label>{{ totalPhotos }} photos</ion-label>
              </ion-chip>
            </div>
          </div>
          <div v-if="totalPhotos > 1" class="toggle-photos-container">
            <button
              class="toggle-photos-btn"
              @click="showAllPhotos = !showAllPhotos"
            >
              <ion-icon :icon="imagesOutline"></ion-icon>
              {{ showAllPhotos ? 'Masquer' : 'Voir toutes les photos' }} ({{ totalPhotos }})
              <ion-icon :icon="showAllPhotos ? chevronUpOutline : chevronDownOutline"></ion-icon>
            </button>
          </div>
          <div v-if="showAllPhotos && totalPhotos > 1" class="photos-gallery">
            <div
              v-for="(photo, index) in allPhotos"
              :key="index"
              class="gallery-item"
            >
              <img :src="photo" :alt="`Photo ${index + 1}`" />
              <div class="photo-number">{{ index + 1 }}</div>
            </div>
          </div>
        </div>
        <ion-chip :color="statusColor" class="status-chip">
          <ion-label>{{ signalement.status_libelle || 'Nouveau' }}</ion-label>
        </ion-chip>
        <ion-chip :color="prioriteColor" outline>
          <ion-label>{{ prioriteLabel }}</ion-label>
        </ion-chip>
        <div class="section">
          <h2>Description</h2>
          <p class="description">{{ signalement.description }}</p>
        </div>
        <div class="section">
          <h2>Localisation</h2>
          <ion-list>
            <ion-item v-if="signalement.ville_nom">
              <ion-icon :icon="locationOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Ville</h3>
                <p>{{ signalement.ville_nom }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="signalement.route_nom">
              <ion-icon :icon="navigateOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Route</h3>
                <p>{{ signalement.route_nom }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="signalement.adresse_precise">
              <ion-icon :icon="mapOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Adresse précise</h3>
                <p>{{ signalement.adresse_precise }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="compassOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Coordonnées GPS</h3>
                <p>{{ signalement.latitude }}, {{ signalement.longitude }}</p>
              </ion-label>
              <ion-button slot="end" fill="clear" @click="openInMaps">
                <ion-icon :icon="navigateCircleOutline"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
        </div>
        <div class="section">
          <h2>Informations</h2>
          <ion-list>
            <ion-item>
              <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Date de signalement</h3>
                <p>{{ formatDate(signalement.date_signalement || signalement.dateCreation || signalement.createdAt) }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="signalement.user_nom">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Signalé par</h3>
                <p>{{ signalement.user_prenom }} {{ signalement.user_nom }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="signalement.surface_m2">
              <ion-icon :icon="resizeOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Surface</h3>
                <p>{{ signalement.surface_m2 }} m²</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="signalement.budget">
              <ion-icon :icon="cashOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Budget</h3>
                <p>{{ formatCurrency(signalement.budget) }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="signalement.entreprise_nom">
              <ion-icon :icon="businessOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Entreprise</h3>
                <p>{{ signalement.entreprise_nom }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="signalement.date_debut">
              <ion-icon :icon="timeOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Date de début</h3>
                <p>{{ formatDate(signalement.date_debut) }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="signalement.date_fin_prevue">
              <ion-icon :icon="alarmOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Date de fin prévue</h3>
                <p>{{ formatDate(signalement.date_fin_prevue) }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="signalement.date_fin_reelle">
              <ion-icon :icon="checkmarkCircleOutline" slot="start" color="success"></ion-icon>
              <ion-label>
                <h3>Date de fin réelle</h3>
                <p>{{ formatDate(signalement.date_fin_reelle) }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="signalement.commentaire">
              <ion-icon :icon="chatbubbleOutline" slot="start"></ion-icon>
              <ion-label>
                <h3>Commentaire</h3>
                <p>{{ signalement.commentaire }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>
        <div class="section">
          <h2>Position sur la carte</h2>
          <div id="minimap" ref="minimapContainer"></div>
        </div>
      </div>
      <div v-else class="error-container">
        <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
        <h2>Signalement introuvable</h2>
        <ion-button @click="router.back()">Retour</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonContent,
  IonChip,
  IonLabel,
  IonList,
  IonItem,
  IonIcon,
  IonSpinner,
  actionSheetController,
  alertController
} from '@ionic/vue';
import {
  ellipsisVerticalOutline,
  locationOutline,
  navigateOutline,
  mapOutline,
  compassOutline,
  navigateCircleOutline,
  calendarOutline,
  personOutline,
  resizeOutline,
  cashOutline,
  businessOutline,
  timeOutline,
  alarmOutline,
  checkmarkCircleOutline,
  chatbubbleOutline,
  alertCircleOutline,
  createOutline,
  trashOutline,
  shareOutline,
  imagesOutline,
  chevronUpOutline,
  chevronDownOutline
} from 'ionicons/icons';
import L from 'leaflet';
import { useSignalementStore } from '@/stores/signalement.firebase';
import { useAuthStore } from '@/stores/auth';
import { PRIORITE_LEVELS } from '@/config/constants';
const router = useRouter();
const route = useRoute();
const signalementStore = useSignalementStore();
const authStore = useAuthStore();
const minimapContainer = ref<HTMLElement | null>(null);
const loading = ref(false);
const showAllPhotos = ref(false);
let minimap: L.Map | null = null;
const signalement = computed(() => signalementStore.currentSignalement);
const statusColor = computed(() => {
  if (!signalement.value) return 'medium';
  switch (signalement.value.status_id) {
    case 1: return 'danger';
    case 2: return 'warning';
    case 3: return 'success';
    default: return 'medium';
  }
});
const prioriteColor = computed(() => {
  if (!signalement.value) return 'medium';
  const level = PRIORITE_LEVELS.find(l => l.value === signalement.value!.priorite);
  return level?.color || 'medium';
});
const prioriteLabel = computed(() => {
  if (!signalement.value) return '';
  const level = PRIORITE_LEVELS.find(l => l.value === signalement.value!.priorite);
  return `Priorité: ${level?.label || signalement.value.priorite}`;
});
const canEdit = computed(() => {
  return authStore.user?.id === signalement.value?.user_id || authStore.isManager;
});
const hasPhotos = computed(() => {
  if (!signalement.value) return false;
  return !!(signalement.value.photoURL || signalement.value.photo_url ||
           (signalement.value.photos && signalement.value.photos.length > 0));
});
const mainPhoto = computed(() => {
  if (!signalement.value) return '';
  return signalement.value.photoURL ||
         signalement.value.photo_url ||
         signalement.value.photos?.[0] || '';
});
const totalPhotos = computed(() => {
  if (!signalement.value) return 0;
  let count = 0;
  if (signalement.value.photoURL || signalement.value.photo_url) count++;
  if (signalement.value.photos && signalement.value.photos.length > 0) {
    count += signalement.value.photos.length;
  }
  return count;
});
const allPhotos = computed(() => {
  if (!signalement.value) return [];
  const photos = [];
  if (signalement.value.photoURL) {
    photos.push(signalement.value.photoURL);
  } else if (signalement.value.photo_url) {
    photos.push(signalement.value.photo_url);
  }
  if (signalement.value.photos && signalement.value.photos.length > 0) {
    photos.push(...signalement.value.photos);
  }
  return [...new Set(photos)];
});
const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'Date non disponible';
  let date: Date;
  if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
    date = new Date(dateValue.seconds * 1000);
  }
  else if (typeof dateValue === 'string' || dateValue instanceof Date) {
    date = new Date(dateValue);
  }
  else {
    return 'Date invalide';
  }
  if (isNaN(date.getTime())) {
    return 'Date invalide';
  }
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA'
  }).format(amount);
};
const initMinimap = () => {
  if (!minimapContainer.value || !signalement.value) return;
  minimap = L.map(minimapContainer.value, {
    center: [signalement.value.latitude, signalement.value.longitude],
    zoom: 15,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(minimap);
  L.marker([signalement.value.latitude, signalement.value.longitude])
    .addTo(minimap);
};
const openInMaps = () => {
  if (!signalement.value) return;
  const url = `https://www.google.com/maps?q=${signalement.value.latitude},${signalement.value.longitude}`;
  window.open(url, '_system');
};
const openMenu = async () => {
  const buttons: any[] = [];
  if (canEdit.value) {
    buttons.push({
      text: 'Modifier',
      icon: createOutline,
      handler: () => {
        router.push(`/signalements/${signalement.value!.id}/edit`);
      }
    });
    buttons.push({
      text: 'Supprimer',
      icon: trashOutline,
      role: 'destructive',
      handler: () => {
        handleDelete();
      }
    });
  }
  buttons.push({
    text: 'Partager',
    icon: shareOutline,
    handler: () => {
    }
  });
  buttons.push({
    text: 'Annuler',
    role: 'cancel'
  });
  const actionSheet = await actionSheetController.create({
    header: 'Actions',
    buttons
  });
  await actionSheet.present();
};
const handleDelete = async () => {
  const alert = await alertController.create({
    header: 'Supprimer le signalement',
    message: 'Êtes-vous sûr de vouloir supprimer ce signalement ? Cette action est irréversible.',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Supprimer',
        role: 'confirm',
        handler: async () => {
          try {
            await signalementStore.deleteSignalement(signalement.value!.id);
            router.replace('/tabs/signalements');
          } catch (error) {
            console.error('Error deleting signalement:', error);
          }
        }
      }
    ]
  });
  await alert.present();
};
const loadSignalement = async () => {
  const id = route.params.id as string;
  if (!id) {
    router.replace('/tabs/signalements');
    return;
  }
  loading.value = true;
  try {
    await signalementStore.fetchSignalementById(id);
  } catch (error) {
    console.error('Error loading signalement:', error);
  } finally {
    loading.value = false;
  }
};
onMounted(async () => {
  await loadSignalement();
  setTimeout(() => {
    initMinimap();
  }, 100);
});
onUnmounted(() => {
  if (minimap) {
    minimap.remove();
    minimap = null;
  }
});
</script>
<style scoped>
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}
.error-icon {
  font-size: 80px;
  color: var(--ion-color-danger);
  margin-bottom: 16px;
}
.detail-container {
  padding-bottom: 32px;
}
.photos-section {
  position: relative;
  margin-bottom: 16px;
}
.photo-container {
  position: relative;
  width: 100%;
  max-height: 400px;
  overflow: hidden;
}
.photo-container img {
  width: 100%;
  height: auto;
  display: block;
}
.photos-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
}
.photos-count {
  background: rgba(0, 0, 0, 0.7);
  color: white;
}
.toggle-photos-container {
  margin: 16px;
  margin-bottom: 0;
}
.toggle-photos-btn {
  width: 100%;
  padding: 12px 16px;
  background: var(--ion-color-light);
  border: 1px solid var(--ion-color-medium);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-color-dark);
  cursor: pointer;
  transition: background-color 0.2s;
}
.toggle-photos-btn:hover {
  background: var(--ion-color-medium);
}
.photos-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  padding: 16px;
}
.gallery-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: var(--ion-color-light);
}
.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.photo-number {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.status-chip,
ion-chip {
  margin: 16px 8px 8px;
}
.section {
  padding: 16px;
}
.section h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--ion-color-dark);
}
.description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--ion-color-dark);
  white-space: pre-wrap;
}
ion-list {
  margin-top: 0;
}
#minimap {
  width: 100%;
  height: 250px;
  border-radius: 12px;
  overflow: hidden;
}
</style>