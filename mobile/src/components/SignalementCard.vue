<template>
  <ion-card class="signalement-card">
    <ion-card-content>
      <div class="card-header">
        <ion-badge :color="statusColor" class="status-badge">
          {{ signalement.status_libelle || 'Nouveau' }}
        </ion-badge>
        <ion-badge :color="prioriteColor" outline class="priorite-badge">
          Priorité {{ signalement.priorite }}
        </ion-badge>
      </div>
      <div class="card-body">
        <p class="description">{{ truncatedDescription }}</p>
        <div class="info-row">
          <div class="info-item">
            <ion-icon :icon="locationOutline"></ion-icon>
            <span>{{ signalement.ville_nom || 'Non spécifiée' }}</span>
          </div>
          <div v-if="signalement.route_nom" class="info-item">
            <ion-icon :icon="navigateOutline"></ion-icon>
            <span>{{ signalement.route_nom }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <ion-icon :icon="calendarOutline"></ion-icon>
            <span>{{ formatDate(signalement.date_signalement) }}</span>
          </div>
        </div>
      </div>
      <div v-if="signalement.photo_url" class="card-image">
        <img :src="signalement.photo_url" alt="Photo du signalement" />
      </div>
    </ion-card-content>
  </ion-card>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { IonCard, IonCardContent, IonBadge, IonIcon } from '@ionic/vue';
import { locationOutline, navigateOutline, calendarOutline } from 'ionicons/icons';
import { PRIORITE_LEVELS } from '@/config/constants';
import type { Signalement } from '@/types';
interface Props {
  signalement: Signalement;
}
const props = defineProps<Props>();
defineEmits<{
  (e: 'click'): void;
}>();
const statusColor = computed(() => {
  switch (props.signalement.status_id) {
    case 1: return 'danger';
    case 2: return 'warning';
    case 3: return 'success';
    default: return 'medium';
  }
});
const prioriteColor = computed(() => {
  const level = PRIORITE_LEVELS.find(l => l.value === props.signalement.priorite);
  return level?.color || 'medium';
});
const truncatedDescription = computed(() => {
  const maxLength = 100;
  if (props.signalement.description.length > maxLength) {
    return props.signalement.description.substring(0, maxLength) + '...';
  }
  return props.signalement.description;
});
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return 'Aujourd\'hui';
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
};
</script>
<style scoped>
.signalement-card {
  margin: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.signalement-card:hover {
  transform: translateY(-2px);
}
.card-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.status-badge,
.priorite-badge {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
}
.card-body {
  margin-bottom: 12px;
}
.description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--ion-color-dark);
  margin: 0 0 12px 0;
}
.info-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ion-color-medium);
}
.info-item ion-icon {
  font-size: 16px;
}
.card-image {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  max-height: 200px;
}
.card-image img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
</style>