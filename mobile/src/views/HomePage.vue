<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Accueil</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <div class="home-container">
        <div class="welcome-section">
          <h1>Bonjour, {{ authStore.userName }}</h1>
          <p class="subtitle">Bienvenue sur Signalement Route Madagascar</p>
        </div>
        <div class="stats-section">
          <h2>Mes statistiques</h2>
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-card class="stat-card stat-total">
                  <ion-card-content>
                    <div class="stat-value">{{ stats.total }}</div>
                    <div class="stat-label">Total</div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="6">
                <ion-card class="stat-card stat-new">
                  <ion-card-content>
                    <div class="stat-value">{{ stats.nouveaux }}</div>
                    <div class="stat-label">Nouveaux</div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col size="6">
                <ion-card class="stat-card stat-progress">
                  <ion-card-content>
                    <div class="stat-value">{{ stats.enCours }}</div>
                    <div class="stat-label">En cours</div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="6">
                <ion-card class="stat-card stat-done">
                  <ion-card-content>
                    <div class="stat-value">{{ stats.termines }}</div>
                    <div class="stat-label">Terminés</div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>
        <div class="actions-section">
          <h2>Actions rapides</h2>
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <router-link to="/signalements/create" class="action-link">
                  <ion-card class="action-card">
                    <ion-card-content>
                      <ion-icon :icon="addCircleOutline" class="action-icon"></ion-icon>
                      <div class="action-label">Nouveau signalement</div>
                    </ion-card-content>
                  </ion-card>
                </router-link>
              </ion-col>
              <ion-col size="6">
                <router-link to="/tabs/map" class="action-link">
                  <ion-card class="action-card">
                    <ion-card-content>
                      <ion-icon :icon="mapOutline" class="action-icon"></ion-icon>
                      <div class="action-label">Voir la carte</div>
                    </ion-card-content>
                  </ion-card>
                </router-link>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>
        <div class="recent-section">
          <div class="section-header">
            <h2>Signalements récents</h2>
            <router-link to="/tabs/signalements" class="see-all-link">
              Voir tout
            </router-link>
          </div>
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <div v-else-if="recentSignalements.length === 0" class="empty-state">
            <ion-icon :icon="documentTextOutline" class="empty-icon"></ion-icon>
            <p>Aucun signalement pour le moment</p>
            <router-link to="/signalements/create" class="create-btn-link">
              <ion-button>Créer un signalement</ion-button>
            </router-link>
          </div>
          <div v-else class="signalements-list">
            <router-link
              v-for="signalement in recentSignalements"
              :key="signalement.id"
              :to="`/signalements/${signalement.id}`"
              class="signalement-link"
            >
              <SignalementCard :signalement="signalement" />
            </router-link>
          </div>
        </div>
        <div v-if="signalementsEnCours.length > 0" class="status-section">
          <div class="section-header">
            <h2>
              <ion-icon :icon="timeOutline" class="section-icon warning"></ion-icon>
              En cours de traitement
            </h2>
          </div>
          <div class="signalements-list">
            <router-link
              v-for="signalement in signalementsEnCours"
              :key="signalement.id"
              :to="`/signalements/${signalement.id}`"
              class="signalement-link"
            >
              <SignalementCard :signalement="signalement" />
            </router-link>
          </div>
        </div>
        <div v-if="signalementsTermines.length > 0" class="status-section">
          <div class="section-header">
            <h2>
              <ion-icon :icon="checkmarkCircleOutline" class="section-icon success"></ion-icon>
              Terminés récemment
            </h2>
          </div>
          <div class="signalements-list">
            <router-link
              v-for="signalement in signalementsTermines"
              :key="signalement.id"
              :to="`/signalements/${signalement.id}`"
              class="signalement-link"
            >
              <SignalementCard :signalement="signalement" />
            </router-link>
          </div>
        </div>
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
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonFab,
  IonFabButton
} from '@ionic/vue';
import {
  refreshOutline,
  addCircleOutline,
  mapOutline,
  documentTextOutline,
  addOutline,
  timeOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { useSignalementStore } from '@/stores/signalement.firebase';
import SignalementCard from '@/components/SignalementCard.vue';
const authStore = useAuthStore();
const signalementStore = useSignalementStore();
const loading = ref(false);
const recentSignalements = computed(() => {
  return signalementStore.signalements.slice(0, 5);
});
const signalementsEnCours = computed(() => {
  return signalementStore.signalements
    .filter(s => s.status === 'en_cours')
    .slice(0, 3);
});
const signalementsTermines = computed(() => {
  return signalementStore.signalements
    .filter(s => s.status === 'termine')
    .slice(0, 3);
});
const stats = computed(() => ({
  total: signalementStore.signalementsCount,
  nouveaux: signalementStore.signalementsParStatut.nouveaux,
  enCours: signalementStore.signalementsParStatut.enCours,
  termines: signalementStore.signalementsParStatut.termines
}));
const refreshData = async () => {
  loading.value = true;
  try {
    if (authStore.isAuthenticated) {
      await signalementStore.fetchMySignalements();
    } else {
      await signalementStore.fetchSignalements();
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    loading.value = false;
  }
};
const handleRefresh = async (event: any) => {
  await refreshData();
  event.target.complete();
};
onMounted(() => {
  refreshData();
});
</script>
<style scoped>
.home-container {
  padding: 16px;
}
.welcome-section {
  margin-bottom: 24px;
}
.welcome-section h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: var(--ion-color-dark);
}
.subtitle {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
}
.stats-section h2,
.actions-section h2,
.recent-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--ion-color-dark);
}
.stat-card {
  margin: 0;
  text-align: center;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  text-transform: uppercase;
}
.stat-total .stat-value {
  color: var(--ion-color-primary);
}
.stat-new .stat-value {
  color: var(--ion-color-danger);
}
.stat-progress .stat-value {
  color: var(--ion-color-warning);
}
.stat-done .stat-value {
  color: var(--ion-color-success);
}
.actions-section {
  margin: 24px 0;
}
.action-card {
  margin: 0;
  text-align: center;
  cursor: pointer;
}
.action-icon {
  font-size: 48px;
  color: var(--ion-color-primary);
  margin-bottom: 8px;
}
.action-label {
  font-size: 14px;
  font-weight: 500;
}
.recent-section {
  margin-top: 24px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.empty-state {
  text-align: center;
  padding: 40px 20px;
}
.empty-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}
.empty-state p {
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}
.signalements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.signalement-link {
  text-decoration: none;
  color: inherit;
  display: block;
}
.action-link {
  text-decoration: none;
  color: inherit;
  display: block;
}
.see-all-link {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}
.create-btn-link {
  text-decoration: none;
}
.status-section {
  margin-top: 24px;
}
.status-section h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--ion-color-dark);
}
.section-icon {
  font-size: 22px;
}
.section-icon.warning {
  color: var(--ion-color-warning);
}
.section-icon.success {
  color: var(--ion-color-success);
}
ion-spinner {
  display: block;
  margin: 40px auto;
}
</style>