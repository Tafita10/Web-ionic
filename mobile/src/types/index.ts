export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  adresse?: string;
  type_user_id: number;
  role: 'visitor' | 'user' | 'manager';
  firebase_uid?: string;
  failed_attempts: number;
  is_blocked: boolean;
  blocked_at?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}
export interface TypeUser {
  id: number;
  libelle: string;
  description?: string;
  created_at: string;
}
export type SignalementType = 'nid-de-poule' | 'fissure' | 'debris' | 'autre';
export type SignalementGravite = 'faible' | 'moyenne' | 'elevee' | 'critique';
export type SignalementStatus = 'en-attente' | 'en-cours' | 'termine' | 'rejete';
export interface Signalement {
  id: number | string;
  userId?: string;
  userEmail?: string;
  titre: string;
  description: string;
  type: SignalementType;
  gravite: SignalementGravite;
  latitude: number;
  longitude: number;
  ville_id?: number;
  route_id?: number;
  adresse_precise?: string;
  status: SignalementStatus;
  priorite: number;
  photoURL?: string;
  photos?: string[];
  surface_m2?: number;
  budget?: number;
  entreprise_id?: number;
  date_debut?: string | any;
  date_fin_prevue?: string | any;
  date_fin_reelle?: string | any;
  commentaire?: string;
  dateCreation?: any;
  createdAt?: any;
  updatedAt?: any;
  is_synced?: boolean;
  firebase_id?: string;
  user_uid?: string;
  user_id?: number;
  url_photo?: string;
  photo_url?: string;
  status_id?: number;
  date_signalement?: string | any;
  created_at?: string;
  updated_at?: string;
  last_sync_at?: string;
  user_nom?: string;
  user_prenom?: string;
  user_role?: string;
  status_libelle?: string;
  status_couleur?: string;
  ville_nom?: string;
  route_nom?: string;
  entreprise_nom?: string;
  entreprise_telephone?: string;
}
export interface SignalementCreate {
  titre: string;
  description: string;
  type: SignalementType;
  gravite: SignalementGravite;
  latitude: number;
  longitude: number;
  adresse_precise?: string;
  priorite?: number;
  route_id?: number;
  ville_id?: number;
  photoURL?: string;
  photos?: string[];
}
export interface Status {
  id: number;
  libelle: string;
  couleur: string;
  description?: string;
  created_at: string;
}
export interface Ville {
  id: number;
  nom: string;
  latitude?: number;
  longitude?: number;
  code_postal?: string;
  pays: string;
  created_at: string;
}
export interface Route {
  id: number;
  nom: string;
  ville_id?: number;
  type_route?: string;
  longueur_km?: number;
  created_at: string;
}
export interface Entreprise {
  id: number;
  nom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville_id?: number;
  siret?: string;
  est_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface HistoriqueStatus {
  id: number;
  signalement_id: number;
  status_ancien_id?: number;
  status_nouveau_id: number;
  user_id?: number;
  commentaire?: string;
  changed_at: string;
  signalement_description?: string;
  status_ancien?: string;
  status_nouveau?: string;
  user_nom?: string;
  user_prenom?: string;
}
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  adresse?: string;
}
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
export interface StatsGlobales {
  total_signalements: number;
  nouveaux: number;
  en_cours: number;
  termines: number;
  surface_totale: number;
  budget_total: number;
  pourcentage_termine: number;
}
export interface UserStats {
  total_signalements: number;
  signalements_nouveaux: number;
  signalements_en_cours: number;
  signalements_termines: number;
}
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}
export interface SignalementFilters {
  status_id?: number;
  ville_id?: number;
  route_id?: number;
  priorite?: number;
  date_debut?: string;
  date_fin?: string;
  user_id?: number;
}
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
export interface ModalOptions {
  title: string;
  message?: string;
  buttons?: ModalButton[];
}
export interface ModalButton {
  text: string;
  role?: string;
  handler?: () => void | boolean;
}