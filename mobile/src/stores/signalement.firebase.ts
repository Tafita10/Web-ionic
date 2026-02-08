import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import SyncService from '@/services/sync.service';
import type { Signalement, SignalementCreate, SignalementFilters } from '@/types';
export const useSignalementStore = defineStore('signalement', () => {
  const signalements = ref<Signalement[]>([]);
  const currentSignalement = ref<Signalement | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const showOnlyMine = ref(false);
  const filters = ref<SignalementFilters>({});
  const signalementsFiltered = computed(() => {
    let filtered = [...signalements.value];
    if (filters.value.status_id) {
      filtered = filtered.filter(s => s.status_id === filters.value.status_id);
    }
    if (filters.value.ville_id) {
      filtered = filtered.filter(s => s.ville_id === filters.value.ville_id);
    }
    if (filters.value.priorite) {
      filtered = filtered.filter(s => s.priorite === filters.value.priorite);
    }
    return filtered;
  });
  const filteredSignalements = signalementsFiltered;
  const signalementsCount = computed(() => signalements.value.length);
  const signalementsParStatut = computed(() => {
    return {
      nouveaux: signalements.value.filter(s => s.status_id === 1).length,
      enCours: signalements.value.filter(s => s.status_id === 2).length,
      termines: signalements.value.filter(s => s.status_id === 3).length
    };
  });
  function setFilters(newFilters: SignalementFilters) {
    filters.value = newFilters;
  }
  function clearFilters() {
    filters.value = {};
  }
  async function fetchSignalements() {
    loading.value = true;
    error.value = null;
    showOnlyMine.value = false;
    try {
      const data = await SyncService.getSignalements();
      signalements.value = data;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des signalements';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function fetchMySignalements() {
    loading.value = true;
    error.value = null;
    showOnlyMine.value = true;
    try {
      const data = await SyncService.getMySignalements();
      signalements.value = data;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement de vos signalements';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function toggleMySignalements() {
    if (showOnlyMine.value) {
      await fetchSignalements();
    } else {
      await fetchMySignalements();
    }
  }
  async function fetchSignalementById(id: number | string) {
    loading.value = true;
    error.value = null;
    try {
      const data = await SyncService.getSignalementById(id);
      if (data) {
        currentSignalement.value = data;
      }
      return data;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement du signalement';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function createSignalement(data: SignalementCreate) {
    loading.value = true;
    error.value = null;
    try {
      const newSignalement = await SyncService.createSignalement(data);
      signalements.value.unshift(newSignalement);
      return newSignalement;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création du signalement';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function updateSignalement(id: number | string, data: Partial<Signalement>) {
    loading.value = true;
    error.value = null;
    try {
      await SyncService.updateSignalement(id, data);
      const index = signalements.value.findIndex(s =>
        s.id === id || s.firebase_id === id
      );
      if (index !== -1) {
        signalements.value[index] = {
          ...signalements.value[index],
          ...data
        };
      }
      if (currentSignalement.value &&
          (currentSignalement.value.id === id ||
           currentSignalement.value.firebase_id === id)) {
        currentSignalement.value = {
          ...currentSignalement.value,
          ...data
        };
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour du signalement';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function deleteSignalement(id: number | string) {
    loading.value = true;
    error.value = null;
    try {
      await SyncService.deleteSignalement(id);
      signalements.value = signalements.value.filter(s =>
        s.id !== id && s.firebase_id !== id
      );
      if (currentSignalement.value &&
          (currentSignalement.value.id === id ||
           currentSignalement.value.firebase_id === id)) {
        currentSignalement.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression du signalement';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function getSyncStats() {
    try {
      const pendingCount = await SyncService.getPendingSyncCount();
      return {
        pending: pendingCount,
        isOnline: true
      };
    } catch (err) {
      console.error('Erreur stats sync:', err);
      return { pending: 0, isOnline: false };
    }
  }
  async function syncToFirebase() {
    loading.value = true;
    try {
      const result = await SyncService.syncToFirebase();
      return result;
    } catch (err: any) {
      error.value = err.message || 'Erreur de synchronisation';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function uploadMultiplePhotos(signalementId: string, photosBase64: string[]): Promise<string[]> {
    try {
      const photoUrls = await SyncService.uploadMultiplePhotos(signalementId, photosBase64);
      const index = signalements.value.findIndex(s =>
        s.id === signalementId || s.firebase_id === signalementId
      );
      if (index !== -1) {
        signalements.value[index].url_photo = photoUrls[0] || '';
      }
      return photoUrls;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'upload des photos';
      throw err;
    }
  }
  return {
    signalements,
    currentSignalement,
    loading,
    error,
    showOnlyMine,
    filters,
    filteredSignalements,
    signalementsFiltered,
    signalementsCount,
    signalementsParStatut,
    setFilters,
    clearFilters,
    fetchSignalements,
    fetchMySignalements,
    toggleMySignalements,
    fetchSignalementById,
    createSignalement,
    updateSignalement,
    deleteSignalement,
    getSyncStats,
    syncToFirebase,
    uploadMultiplePhotos
  };
});