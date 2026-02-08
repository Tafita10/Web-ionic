<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Filtres</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismiss">Fermer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-list>
      <ion-list-header>
        <ion-label>Statut</ion-label>
      </ion-list-header>
      <ion-radio-group v-model="filters.status_id">
        <ion-item>
          <ion-label>Tous</ion-label>
          <ion-radio slot="start" :value="undefined"></ion-radio>
        </ion-item>
        <ion-item>
          <ion-label>Nouveaux</ion-label>
          <ion-radio slot="start" :value="1"></ion-radio>
        </ion-item>
        <ion-item>
          <ion-label>En cours</ion-label>
          <ion-radio slot="start" :value="2"></ion-radio>
        </ion-item>
        <ion-item>
          <ion-label>Terminés</ion-label>
          <ion-radio slot="start" :value="3"></ion-radio>
        </ion-item>
      </ion-radio-group>
    </ion-list>
    <ion-list>
      <ion-list-header>
        <ion-label>Priorité</ion-label>
      </ion-list-header>
      <ion-radio-group v-model="filters.priorite">
        <ion-item>
          <ion-label>Toutes</ion-label>
          <ion-radio slot="start" :value="undefined"></ion-radio>
        </ion-item>
        <ion-item v-for="level in prioriteLevels" :key="level.value">
          <ion-label>{{ level.label }}</ion-label>
          <ion-radio slot="start" :value="level.value"></ion-radio>
        </ion-item>
      </ion-radio-group>
    </ion-list>
    <div class="button-group">
      <ion-button expand="block" @click="applyFilters">
        Appliquer
      </ion-button>
      <ion-button expand="block" fill="outline" @click="resetFilters">
        Réinitialiser
      </ion-button>
    </div>
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
  IonListHeader,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  modalController
} from '@ionic/vue';
import { PRIORITE_LEVELS } from '@/config/constants';
import type { SignalementFilters } from '@/types';
interface Props {
  currentFilters: SignalementFilters;
}
const props = defineProps<Props>();
const prioriteLevels = PRIORITE_LEVELS;
const filters = ref<SignalementFilters>({});
const dismiss = () => {
  modalController.dismiss();
};
const applyFilters = () => {
  modalController.dismiss({ filters: filters.value });
};
const resetFilters = () => {
  filters.value = {};
  applyFilters();
};
onMounted(() => {
  filters.value = { ...props.currentFilters };
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
}
.button-group {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>