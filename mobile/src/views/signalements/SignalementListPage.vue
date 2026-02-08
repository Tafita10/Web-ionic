<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ showOnlyMine ? 'Mes Signalements' : 'Tous les Signalements' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openFilterModal">
            <ion-icon :icon="filterOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <div class="segment-container">
          <button
            :class="['segment-btn', { active: !showOnlyMine }]"
            @click="toggleFilter(false)"
          >
            <ion-icon :icon="globeOutline"></ion-icon>
            Tous
          </button>
          <button
            :class="['segment-btn', { active: showOnlyMine }]"
            @click="toggleFilter(true)"
          >
            <ion-icon :icon="personOutline"></ion-icon>
            Signalements
          </button>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <div class="search-container">
        <input
          type="text"
          class="native-searchbar"
          :value="searchQuery"
          @input="handleSearchInput"
          placeholder="Rechercher un signalement..."
        />
      </div>
      <div v-if="hasActiveFilters" class="active-filters">
        <ion-chip
          v-for="(filter, key) in activeFilters"
          :key="key"
          @click="removeFilter(key)"
        >
          <ion-label>{{ filter }}</ion-label>
          <ion-icon :icon="closeCircleOutline"></ion-icon>
        </ion-chip>
        <ion-button fill="clear" size="small" @click="clearAllFilters">
          Tout effacer
        </ion-button>
      </div>
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Chargement...</p>
      </div>
      <div v-else-if="filteredSignalements.length === 0" class="empty-state">
        <ion-icon :icon="documentTextOutline" class="empty-icon"></ion-icon>
        <h2>Aucun signalement</h2>
        <p v-if="searchQuery">
          Aucun résultat pour "{{ searchQuery }}"
        </p>
        <p v-else>
          Vous n'avez pas encore créé de signalement
        </p>
        <router-link to="/signalements/create" class="create-link">
          <ion-button expand="block">
            Créer un signalement
          </ion-button>
        </router-link>
      </div>
      <div v-else class="signalements-list">
        <router-link
          v-for="signalement in filteredSignalements"
          :key="signalement.id"
          :to="`/signalements/${signalement.id}`"
          class="signalement-link"
        >
          <SignalementCard :signalement="signalement" />
        </router-link>
      </div>
    </ion-content>
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <router-link to="/signalements/create">
        <ion-fab-button>
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </router-link>
    </ion-fab>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonChip,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonFab,
  IonFabButton,
  modalController
} from '@ionic/vue';
import {
  filterOutline,
  closeCircleOutline,
  documentTextOutline,
  addOutline,
  globeOutline,
  personOutline
} from 'ionicons/icons';
import { useSignalementStore } from '@/stores/signalement.firebase';
import SignalementCard from '@/components/SignalementCard.vue';
import FilterModal from '@/components/modals/FilterModal.vue';
const signalementStore = useSignalementStore();
const searchQuery = ref('');
const loading = ref(false);
const showOnlyMine = ref(true);
const filteredSignalements = computed(() => {
  let results = signalementStore.signalementsFiltered;
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    results = results.filter(s =>
      s.description.toLowerCase().includes(query) ||
      s.ville_nom?.toLowerCase().includes(query) ||
      s.route_nom?.toLowerCase().includes(query)
    );
  }
  return results;
});
const hasActiveFilters = computed(() => {
  return Object.keys(signalementStore.filters).length > 0;
});
const activeFilters = computed(() => {
  const filters: Record<string, string> = {};
  if (signalementStore.filters.status_id) {
    const statusLabels: Record<number, string> = {
      1: 'Nouveaux',
      2: 'En cours',
      3: 'Terminés'
    };
    filters.status_id = statusLabels[signalementStore.filters.status_id] || 'Statut';
  }
  if (signalementStore.filters.priorite) {
    filters.priorite = `Priorité ${signalementStore.filters.priorite}`;
  }
  return filters;
});
const handleRefresh = async (event: any) => {
  await loadSignalements();
  event.target.complete();
};
const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
};
const openFilterModal = async () => {
  const modal = await modalController.create({
    component: FilterModal,
    componentProps: {
      currentFilters: signalementStore.filters
    }
  });
  await modal.present();
  const { data } = await modal.onWillDismiss();
  if (data?.filters) {
    signalementStore.setFilters(data.filters);
  }
};
const removeFilter = (filterKey: string) => {
  const newFilters = { ...signalementStore.filters };
  delete newFilters[filterKey as keyof typeof newFilters];
  signalementStore.setFilters(newFilters);
};
const clearAllFilters = () => {
  signalementStore.clearFilters();
};
const toggleFilter = async (onlyMine: boolean) => {
  if (showOnlyMine.value === onlyMine) return;
  showOnlyMine.value = onlyMine;
  await loadSignalements();
};
const loadSignalements = async () => {
  loading.value = true;
  try {
    if (showOnlyMine.value) {
      await signalementStore.fetchMySignalements();
    } else {
      await signalementStore.fetchSignalements();
    }
  } catch (error) {
    console.error('Error loading signalements:', error);
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  loadSignalements();
});
</script>
<style scoped>
.search-container {
  padding: 16px 16px 0;
}
.native-searchbar {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid var(--ion-color-medium);
  border-radius: 12px;
  background: var(--ion-background-color);
  color: var(--ion-text-color);
  outline: none;
  box-sizing: border-box;
}
.native-searchbar:focus {
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 2px rgba(var(--ion-color-primary-rgb), 0.2);
}
.native-searchbar::placeholder {
  color: var(--ion-color-medium);
}
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px;
  align-items: center;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}
.loading-container p {
  margin-top: 16px;
  color: var(--ion-color-medium);
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}
.empty-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}
.empty-state h2 {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: var(--ion-color-dark);
}
.empty-state p {
  color: var(--ion-color-medium);
  margin: 0 0 24px 0;
}
.signalements-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.signalement-link {
  text-decoration: none;
  color: inherit;
  display: block;
}
.create-link {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
}
.segment-container {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
}
.segment-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border: 2px solid var(--ion-color-primary);
  border-radius: 8px;
  background: transparent;
  color: var(--ion-color-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.segment-btn.active {
  background: var(--ion-color-primary);
  color: white;
}
.segment-btn ion-icon {
  font-size: 18px;
}
</style>