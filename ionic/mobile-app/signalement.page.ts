import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonBackButton, IonButton, IonIcon, IonCard, IonCardContent,
  IonModal, IonItem, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonSpinner, IonCardHeader, IonCardSubtitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locate, informationCircleOutline, close } from 'ionicons/icons';
import * as L from 'leaflet';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-signalement',
  templateUrl: './signalement.page.html',
  styleUrls: ['./signalement.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonModal,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonSpinner,
    IonCardHeader,
    IonCardSubtitle
  ]
})
export class SignalementPage implements OnInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;

  private map: any;
  private marker: any;
  markerPosition: any = null;
  showForm = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  formData = {
    titre: '',
    description: '',
    type: 'nid-de-poule',
    gravite: 'moyenne',
    photo: null as File | null
  };

  constructor() {
    addIcons({ locate, informationCircleOutline, close });
  }

  ngOnInit() {
    console.log('SignalementPage initialisee');
  }

  ionViewDidEnter() {
    this.initMap();
  }

  initMap() {
    const defaultLat = 33.5731;
    const defaultLng = -7.5898;

    this.map = L.map(this.mapElement.nativeElement, {
      preferCanvas: true
    }).setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 3,
      tileSize: 256,
      crossOrigin: true,
      keepBuffer: 2,
      updateWhenZooming: false,
      updateWhenIdle: true
    }).addTo(this.map);

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        console.log('Carte recalculee');
      }
    }, 300);

    this.map.on('click', (e: any) => {
      this.handleMapClick(e.latlng);
    });

    this.locateMe(false);
  }

  handleMapClick(latlng: any) {
    console.log('Clic sur la carte:', latlng);
    
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.marker = L.marker([latlng.lat, latlng.lng], { icon: redIcon }).addTo(this.map);
    this.marker.bindPopup(\
      <strong>Nouveau signalement</strong><br>
      Lat: \<br>
      Lng: \
    \).openPopup();

    this.markerPosition = latlng;
    this.showForm = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    console.log('Formulaire devrait ouvrir - showForm:', this.showForm);
  }

  locateMe(showError = true) {
    if (navigator.geolocation) {
      this.loading = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (this.map) {
            this.map.setView([lat, lng], 16);
            
            const blueIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });
            
            L.marker([lat, lng], { icon: blueIcon })
              .addTo(this.map)
              .bindPopup('Vous etes ici')
              .openPopup();
          }
          
          this.loading = false;
        },
        (error) => {
          console.error('Erreur de geolocalisation:', error);
          if (showError) {
            this.errorMessage = 'Impossible de vous localiser. Veuillez activer la geolocalisation.';
            setTimeout(() => this.errorMessage = '', 5000);
          }
          this.loading = false;
        }
      );
    } else {
      if (showError) {
        this.errorMessage = 'La geolocalisation nest pas supportee par votre navigateur.';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    }
  }

  onPhotoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.formData.photo = file;
    }
  }

  async submitSignalement() {
    if (!this.markerPosition) {
      this.errorMessage = 'Veuillez selectionner une position sur la carte.';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    if (!this.formData.titre || !this.formData.description) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        this.errorMessage = 'Vous devez etre connecte pour creer un signalement.';
        this.loading = false;
        return;
      }

      const db = getFirestore();

      const signalementData = {
        titre: this.formData.titre,
        description: this.formData.description,
        type: this.formData.type,
        gravite: this.formData.gravite,
        latitude: this.markerPosition.lat,
        longitude: this.markerPosition.lng,
        userId: user.uid,
        userEmail: user.email,
        status: 'en-attente',
        dateCreation: serverTimestamp()
      };

      await addDoc(collection(db, 'signalements'), signalementData);

      this.successMessage = 'Signalement cree avec succes !';
      
      this.formData = {
        titre: '',
        description: '',
        type: 'nid-de-poule',
        gravite: 'moyenne',
        photo: null
      };
      
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      
      this.markerPosition = null;
      this.showForm = false;

      setTimeout(() => {
        this.successMessage = '';
      }, 5000);

    } catch (error) {
      console.error('Erreur lors de la creation du signalement:', error);
      this.errorMessage = 'Erreur lors de la creation du signalement. Veuillez reessayer.';
    } finally {
      this.loading = false;
    }
  }

  cancelSignalement() {
    this.showForm = false;
    this.formData = {
      titre: '',
      description: '',
      type: 'nid-de-poule',
      gravite: 'moyenne',
      photo: null
    };
    
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    
    this.markerPosition = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  ionViewWillLeave() {
    if (this.map) {
      this.map.remove();
    }
  }
}
