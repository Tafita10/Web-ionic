import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import ApiService from '@/services/api.service';
import type {
  Signalement,
  SignalementCreate,
  SignalementFilters,
  PaginationParams,
  PaginatedResponse
} from '@/types';
export const useSignalementStore = defineStore('signalement', () => {
  const signalements = ref<Signalement[]>([]);
  const currentSignalement = ref<Signalement | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
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
  const signalementsCount = computed(() => signalements.value.length);
  const signalementsParStatut = computed(() => {
    return {
      nouveaux: signalements.value.filter(s => s.status_id === 1).length,
      enCours: signalements.value.filter(s => s.status_id === 2).length,
      termines: signalements.value.filter(s => s.status_id === 3).length
    };
  });
  async function fetchSignalements(params?: PaginationParams): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await ApiService.get<PaginatedResponse<Signalement>>('/signalements', params);
      signalements.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des signalements';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function fetchMySignalements(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await ApiService.get<{ signalements: Signalement[] }>('/signalements/my');
      signalements.value = response.signalements;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement de vos signalements';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function fetchSignalementById(id: number): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await ApiService.get<{ signalement: Signalement }>(`/signalements/${id}`);
      currentSignalement.value = response.signalement;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement du signalement';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function createSignalement(data: SignalementCreate): Promise<Signalement> {
    loading.value = true;
    error.value = null;
    try {
      const response = await ApiService.post<{ signalement: Signalement }>('/signalements', data);
      signalements.value.unshift(response.signalement);
      return response.signalement;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création du signalement';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function updateSignalement(id: number, data: Partial<Signalement>): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await ApiService.put<{ signalement: Signalement }>(`/signalements/${id}`, data);
      const index = signalements.value.findIndex(s => s.id === id);
      if (index !== -1) {
        signalements.value[index] = response.signalement;
      }
      if (currentSignalement.value?.id === id) {
        currentSignalement.value = response.signalement;
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour du signalement';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function deleteSignalement(id: number): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await ApiService.delete(`/signalements/${id}`);
      signalements.value = signalements.value.filter(s => s.id !== id);
      if (currentSignalement.value?.id === id) {
        currentSignalement.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression du signalement';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function uploadPhoto(signalementId: number, base64Photo: string): Promise<string> {
    loading.value = true;
    error.value = null;
    try {
      const response = await ApiService.uploadBase64<{ photo_url: string }>(
        `/signalements/${signalementId}/photo`,
        base64Photo,
        `signalement_${signalementId}_${Date.now()}.jpg`
      );
      return response.photo_url;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du téléchargement de la photo';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function uploadMultiplePhotos(signalementId: number, photosBase64: string[]): Promise<string[]> {
    loading.value = true;
    error.value = null;
    try {
      const photoUrls: string[] = [];
      for (let i = 0; i < photosBase64.length; i++) {
        const response = await ApiService.uploadBase64<{ photo_url: string }>(
          `/signalements/${signalementId}/photo`,
          photosBase64[i],
          `signalement_${signalementId}_${Date.now()}_${i}.jpg`
        );
        photoUrls.push(response.photo_url);
      }
      return photoUrls;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du téléchargement des photos';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  function setFilters(newFilters: SignalementFilters): void {
    filters.value = newFilters;
  }
  function clearFilters(): void {
    filters.value = {};
  }
  function clearError(): void {
    error.value = null;
  }
  return {
    signalements,
    currentSignalement,
    loading,
    error,
    filters,
    signalementsFiltered,
    signalementsCount,
    signalementsParStatut,
    fetchSignalements,
    fetchMySignalements,
    fetchSignalementById,
    createSignalement,
    updateSignalement,
    deleteSignalement,
    uploadPhoto,
    uploadMultiplePhotos,
    setFilters,
    clearFilters,
    clearError
  };
});