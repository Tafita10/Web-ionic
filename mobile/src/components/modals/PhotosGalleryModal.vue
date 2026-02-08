<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Photos du signalement</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="closeModal">
          <ion-icon :icon="closeOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content :fullscreen="true">
    <div class="gallery-container">
      <div v-if="photos.length > 0" class="main-photo-container">
        <img
          :src="photos[currentPhotoIndex]"
          :alt="`Photo ${currentPhotoIndex + 1}`"
          @click="toggleFullscreen"
          class="main-photo"
        />
        <div v-if="photos.length > 1" class="photo-navigation">
          <ion-button
            fill="clear"
            @click="previousPhoto"
            :disabled="currentPhotoIndex === 0"
            class="nav-button"
          >
            <ion-icon :icon="chevronBackOutline"></ion-icon>
          </ion-button>
          <div class="photo-counter">
            {{ currentPhotoIndex + 1 }} / {{ photos.length }}
          </div>
          <ion-button
            fill="clear"
            @click="nextPhoto"
            :disabled="currentPhotoIndex === photos.length - 1"
            class="nav-button"
          >
            <ion-icon :icon="chevronForwardOutline"></ion-icon>
          </ion-button>
        </div>
      </div>
      <div v-if="photos.length > 1" class="thumbnails-container">
        <div class="thumbnails-grid">
          <div
            v-for="(photo, index) in photos"
            :key="index"
            :class="['thumbnail', { active: index === currentPhotoIndex }]"
            @click="currentPhotoIndex = index"
          >
            <img :src="photo" :alt="`Miniature ${index + 1}`" />
            <div v-if="index === currentPhotoIndex" class="thumbnail-overlay">
              <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
            </div>
          </div>
        </div>
      </div>
      <div class="actions-container">
        <ion-button
          expand="block"
          fill="outline"
          @click="downloadPhoto"
        >
          <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
          Télécharger cette photo
        </ion-button>
        <ion-button
          expand="block"
          fill="outline"
          @click="sharePhoto"
        >
          <ion-icon :icon="shareOutline" slot="start"></ion-icon>
          Partager cette photo
        </ion-button>
      </div>
    </div>
  </ion-content>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  modalController,
  toastController
} from '@ionic/vue';
import {
  closeOutline,
  chevronBackOutline,
  chevronForwardOutline,
  checkmarkCircleOutline,
  downloadOutline,
  shareOutline
} from 'ionicons/icons';
interface Props {
  photos: string[];
}
const props = defineProps<Props>();
const emit = defineEmits(['close']);
const currentPhotoIndex = ref(0);
const closeModal = async () => {
  const modal = await modalController.getTop();
  if (modal) {
    await modal.dismiss();
  }
};
const previousPhoto = () => {
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--;
  }
};
const nextPhoto = () => {
  if (currentPhotoIndex.value < props.photos.length - 1) {
    currentPhotoIndex.value++;
  }
};
const toggleFullscreen = () => {
  console.log('Toggle fullscreen for photo:', currentPhotoIndex.value);
};
const downloadPhoto = async () => {
  try {
    const currentPhoto = props.photos[currentPhotoIndex.value];
    if (currentPhoto.startsWith('data:image')) {
      const link = document.createElement('a');
      link.href = currentPhoto;
      link.download = `signalement-photo-${currentPhotoIndex.value + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      const toast = await toastController.create({
        message: 'Photo téléchargée avec succès',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    } else {
      window.open(currentPhoto, '_blank');
    }
  } catch (error) {
    const toast = await toastController.create({
      message: 'Erreur lors du téléchargement',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
};
const sharePhoto = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Photo du signalement',
        url: props.photos[currentPhotoIndex.value]
      });
    } else {
      await navigator.clipboard.writeText(props.photos[currentPhotoIndex.value]);
      const toast = await toastController.create({
        message: 'Lien de la photo copié dans le presse-papiers',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    }
  } catch (error) {
    const toast = await toastController.create({
      message: 'Erreur lors du partage',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
};
</script>
<style scoped>
.gallery-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.main-photo-container {
  position: relative;
  width: 100%;
}
.main-photo {
  width: 100%;
  height: auto;
  max-height: 50vh;
  object-fit: contain;
  border-radius: 12px;
  cursor: pointer;
}
.photo-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  padding: 12px;
  background: var(--ion-color-light);
  border-radius: 24px;
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
}
.nav-button {
  --padding-start: 8px;
  --padding-end: 8px;
}
.photo-counter {
  font-weight: 600;
  color: var(--ion-color-dark);
  min-width: 60px;
  text-align: center;
}
.thumbnails-container {
  margin-top: 16px;
}
.thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}
.thumbnail {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.thumbnail.active {
  border-color: var(--ion-color-primary);
}
.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumbnail-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--ion-color-primary);
  border-radius: 50%;
  padding: 2px;
  color: white;
}
.actions-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
@media (min-width: 768px) {
  .main-photo {
    max-height: 60vh;
  }
  .thumbnails-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>