import { Preferences } from '@capacitor/preferences';
export class StorageService {
  static async set(key: string, value: any): Promise<void> {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      await Preferences.set({ key, value: data });
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }
  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key });
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error('Error getting from storage:', error);
      return null;
    }
  }
  static async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }
  static async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
  static async keys(): Promise<string[]> {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch (error) {
      console.error('Error getting keys from storage:', error);
      return [];
    }
  }
}