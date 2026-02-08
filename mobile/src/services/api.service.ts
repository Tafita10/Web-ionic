import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '@/config/constants';
import { StorageService } from './storage.service';
class ApiService {
  private api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS
    });
    this.setupInterceptors();
  }
  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await StorageService.get(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              await StorageService.remove(STORAGE_KEYS.AUTH_TOKEN);
              await StorageService.remove(STORAGE_KEYS.USER_DATA);
              window.location.href = '/login';
              throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
            case 403:
              throw new Error(ERROR_MESSAGES.FORBIDDEN);
            case 404:
              throw new Error(ERROR_MESSAGES.NOT_FOUND);
            case 500:
            case 502:
            case 503:
              throw new Error(ERROR_MESSAGES.SERVER_ERROR);
            default:
              throw new Error((error.response.data as any)?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
          }
        } else if (error.request) {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        } else {
          throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
        }
      }
    );
  }
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<T>(url, { params });
    return response.data;
  }
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<T>(url, data);
    return response.data;
  }
  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.patch<T>(url, data);
    return response.data;
  }
  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url);
    return response.data;
  }
  async upload<T>(url: string, file: File | Blob, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
    return response.data;
  }
  async uploadBase64<T>(url: string, base64Data: string, filename: string): Promise<T> {
    const data = {
      image: base64Data,
      filename: filename
    };
    return this.post<T>(url, data);
  }
}
export default new ApiService();