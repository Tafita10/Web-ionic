<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="homeOutline"></ion-icon>
          <ion-label>Accueil</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="map" href="/tabs/map">
          <ion-icon :icon="mapOutline"></ion-icon>
          <ion-label>Carte</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="signalements" href="/tabs/signalements">
          <ion-icon :icon="listOutline"></ion-icon>
          <ion-label>Signalements</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="personOutline"></ion-icon>
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>
<script setup lang="ts">
import {
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet
} from '@ionic/vue';
import { homeOutline, mapOutline, listOutline, personOutline } from 'ionicons/icons';
</script>