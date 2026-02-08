<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Carte des signalements</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshMap" :disabled="isLoading">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
          <ion-button @click="centerOnUser" :disabled="isLoading">
            <ion-icon :icon="locateOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="map-container">
        <div id="map" ref="mapContainer"></div>
        <div v-if="isLoading" class="map-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <span>Chargement...</span>
        </div>
        <div v-if="selectedPosition" class="selection-info">
          <div class="selection-content">
            <ion-icon :icon="locationOutline" color="primary"></ion-icon>
            <div class="selection-coords">
              <span>Position sélectionnée</span>
              <small>{{ selectedPosition.lat.toFixed(6) }}, {{ selectedPosition.lng.toFixed(6) }}</small>
            </div>
            <ion-button size="small" @click="createSignalementAtSelectedPosition">
              <ion-icon :icon="addOutline" slot="start"></ion-icon>
              Signaler
            </ion-button>
            <ion-button size="small" fill="clear" color="medium" @click="clearSelection">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </div>
        </div>
        <div class="map-filters">
          <div class="filter-toggle">
            <ion-checkbox v-model="showOnlyMine" @ionChange="onToggleMySignalements">
              Mes signalements uniquement
            </ion-checkbox>
          </div>
          <ion-segment v-model="selectedStatus" @ionChange="filterMarkers">
            <ion-segment-button value="all">
              <ion-label>Tous</ion-label>
            </ion-segment-button>
            <ion-segment-button value="1">
              <ion-label>Nouveaux</ion-label>
            </ion-segment-button>
            <ion-segment-button value="2">
              <ion-label>En cours</ion-label>
            </ion-segment-button>
            <ion-segment-button value="3">
              <ion-label>Terminés</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>
        <div class="map-legend">
          <div class="legend-item">
            <span class="legend-marker marker-new"></span>
            <span>Nouveau</span>
          </div>
          <div class="legend-item">
            <span class="legend-marker marker-progress"></span>
            <span>En cours</span>
          </div>
          <div class="legend-item">
            <span class="legend-marker marker-done"></span>
            <span>Terminé</span>
          </div>
          <div class="legend-item legend-hint">
            <ion-icon :icon="fingerPrintOutline" size="small"></ion-icon>
            <span>Appui long = signaler</span>
          </div>
        </div>
        <div v-if="showInstructions" class="map-instructions" @click="showInstructions = false">
          <ion-icon :icon="informationCircleOutline"></ion-icon>
          <span>Appuyez longuement sur la carte pour sélectionner une position</span>
          <ion-icon :icon="closeOutline" class="close-icon"></ion-icon>
        </div>
      </div>
    </ion-content>
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="createSignalementAtCurrentLocation" :disabled="isLoading">
        <ion-icon :icon="addOutline"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonFab,
  IonFabButton,
  IonCheckbox,
  IonSpinner,
  toastController
} from '@ionic/vue';
import {
  locateOutline,
  addOutline,
  refreshOutline,
  locationOutline,
  closeOutline,
  informationCircleOutline,
  fingerPrintOutline
} from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Geolocation } from '@capacitor/geolocation';
import { useSignalementStore } from '@/stores/signalement.firebase';
import { MAP_CONFIG, GEOLOCATION_OPTIONS, ERROR_MESSAGES } from '@/config/constants';
import type { Signalement } from '@/types';
const router = useRouter();
const signalementStore = useSignalementStore();
const mapContainer = ref<HTMLElement | null>(null);
const selectedStatus = ref('all');
const showOnlyMine = ref(false);
const isLoading = ref(false);
const showInstructions = ref(true);
const selectedPosition = ref<{ lat: number; lng: number } | null>(null);
let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
let userMarker: L.Marker | null = null;
let selectionMarker: L.Marker | null = null;
let userLocation: { lat: number; lng: number } | null = null;
let isMapReady = false;
let pressTimer: ReturnType<typeof setTimeout> | null = null;
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
const onToggleMySignalements = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    if (showOnlyMine.value) {
      await signalementStore.fetchMySignalements();
    } else {
      await signalementStore.fetchSignalements();
    }
    updateMarkers();
    const toast = await toastController.create({
      message: `${signalementStore.signalements.length} signalements`,
      duration: 1500,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Erreur lors du chargement',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};
const initMap = async () => {
  if (!mapContainer.value || map) return;
  try {
    map = L.map(mapContainer.value, {
      center: MAP_CONFIG.DEFAULT_CENTER,
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
      touchZoom: true,
      dragging: true,
      doubleClickZoom: true,
      scrollWheelZoom: true
    });
    const tileLayer = L.tileLayer(MAP_CONFIG.TILE_URL, {
      attribution: MAP_CONFIG.ATTRIBUTION,
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      minZoom: MAP_CONFIG.MIN_ZOOM,
      crossOrigin: true,
      updateWhenZooming: false,
      updateWhenIdle: true
    });
    tileLayer.on('tileerror', (error) => {
      console.warn('Tile error:', error);
    });
    tileLayer.addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    let isPressing = false;
    let startLatLng: L.LatLng | null = null;
    let touchStartPoint: L.Point | null = null;
    map.on('mousedown', (e: L.LeafletMouseEvent) => {
      isPressing = true;
      startLatLng = e.latlng;
      pressTimer = setTimeout(() => {
        if (isPressing && startLatLng) {
          handleMapLongPress(startLatLng);
        }
      }, 600);
    });
    const mapElement = mapContainer.value;
    if (mapElement) {
      mapElement.addEventListener('touchstart', (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        isPressing = true;
        const touch = e.touches[0];
        const mapRect = mapElement.getBoundingClientRect();
        const containerPoint = L.point(
          touch.clientX - mapRect.left,
          touch.clientY - mapRect.top
        );
        touchStartPoint = containerPoint;
        if (map) {
          startLatLng = map.containerPointToLatLng(containerPoint);
        }
        pressTimer = setTimeout(() => {
          if (isPressing && startLatLng && map) {
            e.preventDefault();
            handleMapLongPress(startLatLng);
          }
        }, 600);
      }, { passive: false });
      mapElement.addEventListener('touchmove', (e: TouchEvent) => {
        if (!isPressing || !touchStartPoint || e.touches.length !== 1) {
          cancelPress();
          return;
        }
        const touch = e.touches[0];
        const mapRect = mapElement.getBoundingClientRect();
        const currentPoint = L.point(
          touch.clientX - mapRect.left,
          touch.clientY - mapRect.top
        );
        const distance = Math.sqrt(
          Math.pow(currentPoint.x - touchStartPoint.x, 2) +
          Math.pow(currentPoint.y - touchStartPoint.y, 2)
        );
        if (distance > 15) {
          cancelPress();
        }
      }, { passive: true });
      mapElement.addEventListener('touchend', () => {
        cancelPress();
      }, { passive: true });
      mapElement.addEventListener('touchcancel', () => {
        cancelPress();
      }, { passive: true });
    }
    const cancelPress = () => {
      isPressing = false;
      touchStartPoint = null;
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    map.on('mouseup', cancelPress);
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (startLatLng && isPressing) {
        const distance = map!.distance(startLatLng, e.latlng);
        if (distance > 10) {
          cancelPress();
        }
      }
    });
    map.on('dragstart', cancelPress);
    await nextTick();
    setTimeout(() => {
      map?.invalidateSize();
      isMapReady = true;
    }, 100);
  } catch (error) {
    console.error('Map init error:', error);
    const toast = await toastController.create({
      message: 'Erreur lors de l\'initialisation de la carte',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
};
const handleMapLongPress = async (latlng: L.LatLng) => {
  selectedPosition.value = {
    lat: latlng.lat,
    lng: latlng.lng
  };
  updateSelectionMarker(latlng);
  try {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  } catch (e) {
    console.log('Vibration not supported');
  }
  const toast = await toastController.create({
    message: 'Position sélectionnée ! Appuyez sur "Signaler" pour créer un signalement.',
    duration: 2000,
    color: 'success',
    position: 'bottom'
  });
  await toast.present();
  showInstructions.value = false;
};
const updateSelectionMarker = (latlng: L.LatLng) => {
  if (!map) return;
  const selectionIcon = L.divIcon({
    html: `
      <div class="selection-marker-icon">
        <div class="pulse-ring"></div>
        <div class="marker-pin"></div>
      </div>
    `,
    className: 'selection-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  if (selectionMarker) {
    selectionMarker.setLatLng(latlng);
  } else {
    selectionMarker = L.marker(latlng, {
      icon: selectionIcon,
      zIndexOffset: 1000
    }).addTo(map);
  }
};
const clearSelection = () => {
  selectedPosition.value = null;
  if (selectionMarker && map) {
    map.removeLayer(selectionMarker);
    selectionMarker = null;
  }
};
const createSignalementAtSelectedPosition = () => {
  if (!selectedPosition.value) return;
  router.push({
    path: '/signalements/create',
    query: {
      lat: selectedPosition.value.lat.toString(),
      lng: selectedPosition.value.lng.toString()
    }
  });
};
const getMarkerColor = (statusId: number): string => {
  switch (statusId) {
    case 1: return '#ef4444';
    case 2: return '#f97316';
    case 3: return '#22c55e';
    default: return '#6b7280';
  }
};
const createMarkerIcon = (statusId: number): L.DivIcon => {
  const color = getMarkerColor(statusId);
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>`,
    className: 'signalement-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};
const updateMarkers = () => {
  if (!map || !markersLayer || !isMapReady) return;
  markersLayer.clearLayers();
  const signalements = selectedStatus.value === 'all'
    ? signalementStore.signalements
    : signalementStore.signalements.filter(s => s.status_id === parseInt(selectedStatus.value));
  signalements.forEach((signalement: Signalement) => {
    if (!signalement.latitude || !signalement.longitude) return;
    const marker = L.marker(
      [signalement.latitude, signalement.longitude],
      { icon: createMarkerIcon(signalement.status_id) }
    );
    const popupContent = `
      <div style="min-width: 160px; max-width: 220px;">
        <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: ${getMarkerColor(signalement.status_id)};">
          ${signalement.status_libelle || 'Signalement'}
        </h4>
        <p style="margin: 0 0 6px 0; font-size: 11px; line-height: 1.3; color: #333;">
          ${signalement.description.length > 60 ? signalement.description.substring(0, 60) + '...' : signalement.description}
        </p>
        ${signalement.adresse_precise ? `<p style="margin: 0 0 4px 0; font-size: 10px; color: #666;">📍 ${signalement.adresse_precise}</p>` : ''}
        <button onclick="window.navigateToSignalement('${signalement.id || signalement.firebase_id}')"
                style="margin-top: 6px; padding: 5px 10px; background: #3880ff; color: white; border: none; border-radius: 4px; font-size: 10px; cursor: pointer; width: 100%;">
          Voir détails
        </button>
      </div>
    `;
    marker.bindPopup(popupContent, {
      closeButton: true,
      autoClose: true
    });
    markersLayer!.addLayer(marker);
  });
};
(window as any).navigateToSignalement = (id: string) => {
  router.push(`/signalements/${id}`);
};
const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    const position = await Geolocation.getCurrentPosition({
      ...GEOLOCATION_OPTIONS,
      timeout: 15000
    });
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
  } catch (error: any) {
    console.error('Location error:', error);
    let message = ERROR_MESSAGES.LOCATION_ERROR;
    if (error.code === 1) {
      message = 'Permission GPS refusée';
    } else if (error.code === 2) {
      message = 'Position indisponible';
    } else if (error.code === 3) {
      message = 'Délai GPS dépassé';
    }
    const toast = await toastController.create({
      message,
      duration: 3000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
    return null;
  }
};
const centerOnUser = async () => {
  if (!map || isLoading.value) return;
  isLoading.value = true;
  try {
    const location = await getCurrentLocation();
    if (location) {
      userLocation = location;
      map.setView([location.lat, location.lng], 15, {
        animate: true,
        duration: 0.5
      });
      const userIcon = L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="position: absolute; top: -8px; left: -8px; width: 16px; height: 16px; background: rgba(56, 128, 255, 0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
            <div style="background-color: #3880ff; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(56, 128, 255, 0.5);"></div>
          </div>
        `,
        className: 'user-marker',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      if (userMarker) {
        userMarker.setLatLng([location.lat, location.lng]);
      } else {
        userMarker = L.marker([location.lat, location.lng], {
          icon: userIcon,
          zIndexOffset: 500
        })
          .bindPopup('<strong>📍 Vous êtes ici</strong>')
          .addTo(map);
      }
      const toast = await toastController.create({
        message: 'Position mise à jour',
        duration: 1500,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    }
  } finally {
    isLoading.value = false;
  }
};
const filterMarkers = debounce(() => {
  updateMarkers();
}, 200);
const createSignalementAtCurrentLocation = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    let location = userLocation;
    if (!location) {
      location = await getCurrentLocation();
    }
    if (location) {
      router.push({
        path: '/signalements/create',
        query: {
          lat: location.lat.toString(),
          lng: location.lng.toString()
        }
      });
    }
  } finally {
    isLoading.value = false;
  }
};
const loadSignalements = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    await signalementStore.fetchSignalements();
    updateMarkers();
  } catch (error: any) {
    console.error('Load error:', error);
    const toast = await toastController.create({
      message: 'Erreur lors du chargement',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};
const refreshMap = async () => {
  if (isLoading.value) return;
  clearSelection();
  await loadSignalements();
  setTimeout(() => {
    map?.invalidateSize();
  }, 100);
  const toast = await toastController.create({
    message: 'Carte actualisée',
    duration: 1500,
    color: 'success',
    position: 'bottom'
  });
  await toast.present();
};
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/tabs/map' && isMapReady) {
    loadSignalements();
    setTimeout(() => {
      map?.invalidateSize();
    }, 100);
  }
});
onMounted(async () => {
  await nextTick();
  await initMap();
  setTimeout(async () => {
    await loadSignalements();
    await centerOnUser();
  }, 200);
});
onUnmounted(() => {
  if (pressTimer) {
    clearTimeout(pressTimer);
  }
  if (markersLayer) {
    markersLayer.clearLayers();
    markersLayer = null;
  }
  if (map) {
    map.off();
    map.remove();
    map = null;
  }
  userMarker = null;
  selectionMarker = null;
  isMapReady = false;
  delete (window as any).navigateToSignalement;
});
</script>
<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}
#map {
  width: 100%;
  height: 100%;
  z-index: 1;
}
.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background: rgba(255, 255, 255, 0.95);
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #333;
}
.selection-info {
  position: absolute;
  bottom: 100px;
  left: 16px;
  right: 16px;
  z-index: 1001;
}
.selection-content {
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 10px;
}
.selection-coords {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.selection-coords span {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}
.selection-coords small {
  font-size: 10px;
  color: #666;
}
.map-filters {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 1000;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filter-toggle {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
}
.filter-toggle ion-checkbox {
  margin-right: 8px;
}
.map-legend {
  position: absolute;
  bottom: 16px;
  left: 12px;
  z-index: 1000;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.legend-hint {
  border-top: 1px solid #e0e0e0;
  padding-top: 6px;
  margin-top: 2px;
  color: #666;
}
.legend-marker {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.marker-new {
  background-color: #ef4444;
}
.marker-progress {
  background-color: #f97316;
}
.marker-done {
  background-color: #22c55e;
}
.map-instructions {
  position: absolute;
  bottom: 100px;
  left: 12px;
  right: 12px;
  z-index: 1000;
  background: rgba(56, 128, 255, 0.95);
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  cursor: pointer;
}
.map-instructions .close-icon {
  margin-left: auto;
  opacity: 0.7;
}
:deep(.leaflet-pane),
:deep(.leaflet-tile),
:deep(.leaflet-marker-icon),
:deep(.leaflet-marker-shadow),
:deep(.leaflet-tile-container),
:deep(.leaflet-popup),
:deep(.leaflet-zoom-box) {
  position: absolute;
}
:deep(.leaflet-container) {
  background: #e5e7eb;
  font-family: inherit;
}
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}
:deep(.leaflet-popup-content) {
  margin: 10px;
}
:deep(.selection-marker) {
  background: transparent !important;
  border: none !important;
}
:deep(.selection-marker-icon) {
  position: relative;
}
:deep(.selection-marker-icon .pulse-ring) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(56, 128, 255, 0.3);
  animation: pulse-ring 1.5s ease-out infinite;
}
:deep(.selection-marker-icon .marker-pin) {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background: #3880ff;
  border-radius: 50% 50% 50% 0;
  transform: translateX(-50%) rotate(-45deg);
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.1;
  }
}
</style>