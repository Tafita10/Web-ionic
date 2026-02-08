<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mon Profil</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="profile-container">
        <div class="profile-header">
          <div class="avatar">
            <ion-icon :icon="personCircleOutline"></ion-icon>
          </div>
          <h2>{{ authStore.userName }}</h2>
          <ion-badge :color="roleBadgeColor">{{ roleLabel }}</ion-badge>
        </div>
        <ion-list>
          <ion-list-header>
            <ion-label>Informations personnelles</ion-label>
          </ion-list-header>
          <ion-item>
            <ion-icon :icon="mailOutline" slot="start"></ion-icon>
            <ion-label>
              <h3>Email</h3>
              <p>{{ authStore.user?.email }}</p>
            </ion-label>
          </ion-item>
          <ion-item v-if="authStore.user?.telephone">
            <ion-icon :icon="callOutline" slot="start"></ion-icon>
            <ion-label>
              <h3>Téléphone</h3>
              <p>{{ authStore.user?.telephone }}</p>
            </ion-label>
          </ion-item>
          <ion-item v-if="authStore.user?.adresse">
            <ion-icon :icon="locationOutline" slot="start"></ion-icon>
            <ion-label>
              <h3>Adresse</h3>
              <p>{{ authStore.user?.adresse }}</p>
            </ion-label>
          </ion-item>
          <ion-item button @click="openEditProfile">
            <ion-icon :icon="createOutline" slot="start"></ion-icon>
            <ion-label>
              <h3>Modifier le profil</h3>
            </ion-label>
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
        </ion-list>
        <ion-list>
          <ion-list-header>
            <ion-label>Mes statistiques</ion-label>
          </ion-list-header>
          <ion-item>
            <ion-icon :icon="statsChartOutline" slot="start"></ion-icon>
            <ion-label>
              <h3>Total de signalements</h3>
              <p>{{ signalementStore.signalementsCount }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-icon :icon="timeOutline" slot="start" color="danger"></ion-icon>
            <ion-label>
              <h3>Nouveaux</h3>
              <p>{{ signalementStore.signalementsParStatut.nouveaux }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-icon :icon="constructOutline" slot="start" color="warning"></ion-icon>
            <ion-label>
              <h3>En cours</h3>
              <p>{{ signalementStore.signalementsParStatut.enCours }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-icon :icon="checkmarkCircleOutline" slot="start" color="success"></ion-icon>
            <ion-label>
              <h3>Terminés</h3>
              <p>{{ signalementStore.signalementsParStatut.termines }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
        <ion-list>
          <ion-list-header>
            <ion-label>Paramètres</ion-label>
          </ion-list-header>
          <ion-item button @click="router.push('/notifications/settings')">
            <ion-icon :icon="notificationsOutline" slot="start"></ion-icon>
            <ion-label>
              <h3>Notifications</h3>
              <p>Gérer les alertes de changement de statut</p>
            </ion-label>
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
          <ion-item button @click="openChangePassword">
            <ion-icon :icon="keyOutline" slot="start"></ion-icon>
            <ion-label>
              <h3>Changer le mot de passe</h3>
            </ion-label>
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
          <ion-item button @click="handleLogout">
            <ion-icon :icon="logOutOutline" slot="start" color="danger"></ion-icon>
            <ion-label color="danger">
              <h3>Déconnexion</h3>
            </ion-label>
          </ion-item>
        </ion-list>
        <div class="app-info">
          <p>Version 1.0.0</p>
          <p>© 2026 Signalement Route Madagascar</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
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
  IonIcon,
  IonBadge,
  alertController,
  modalController
} from '@ionic/vue';
import {
  personCircleOutline,
  mailOutline,
  callOutline,
  locationOutline,
  createOutline,
  statsChartOutline,
  timeOutline,
  constructOutline,
  checkmarkCircleOutline,
  keyOutline,
  logOutOutline,
  chevronForwardOutline,
  notificationsOutline
} from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { useSignalementStore } from '@/stores/signalement.firebase';
import EditProfileModal from '@/components/modals/EditProfileModal.vue';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal.vue';
const router = useRouter();
const authStore = useAuthStore();
const signalementStore = useSignalementStore();
const roleLabel = computed(() => {
  switch (authStore.userRole) {
    case 'manager': return 'Manager';
    case 'user': return 'Utilisateur';
    case 'visitor': return 'Visiteur';
    default: return 'Utilisateur';
  }
});
const roleBadgeColor = computed(() => {
  switch (authStore.userRole) {
    case 'manager': return 'success';
    case 'user': return 'primary';
    case 'visitor': return 'medium';
    default: return 'medium';
  }
});
const openEditProfile = async () => {
  const modal = await modalController.create({
    component: EditProfileModal,
    componentProps: {
      user: authStore.user
    }
  });
  await modal.present();
};
const openChangePassword = async () => {
  const modal = await modalController.create({
    component: ChangePasswordModal
  });
  await modal.present();
};
const handleLogout = async () => {
  const alert = await alertController.create({
    header: 'Déconnexion',
    message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Déconnexion',
        role: 'confirm',
        handler: async () => {
          await authStore.logout();
          router.replace('/login');
        }
      }
    ]
  });
  await alert.present();
};
</script>
<style scoped>
.profile-container {
  padding: 16px;
}
.profile-header {
  text-align: center;
  padding: 32px 16px;
  margin-bottom: 24px;
}
.avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar ion-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
}
.profile-header h2 {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
}
ion-list {
  margin-bottom: 24px;
}
ion-list-header {
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
}
ion-item ion-icon[slot="start"] {
  margin-right: 16px;
}
.app-info {
  text-align: center;
  padding: 32px 16px;
  color: var(--ion-color-medium);
}
.app-info p {
  margin: 4px 0;
  font-size: 12px;
}
</style>