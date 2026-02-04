import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const centreTana = { lat: -18.8792, lng: 47.5079 };
// Tuiles locales - Données Madagascar OSM téléchargées et hébergées localement
// Serveur tile_server génère les tiles d'Antananarivo avec toutes les rues
const tuileLocale = import.meta.env.VITE_TILE_URL || 'http://localhost:8090/tile/{z}/{x}/{y}.png';

const icone = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const GestionnaireClicCarte = ({ onClicCarte }) => {
  useMapEvents({
    click: (e) => {
      if (onClicCarte) {
        onClicCarte({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
};

const CarteTana = ({ signalements = [], onClicCarte }) => {
  const marqueurs = useMemo(() => signalements.filter((s) => s.latitude && s.longitude), [signalements]);

  return (
    <div className="bloc carte-bloc">
      <h3>🗺️ Carte Antananarivo - OpenStreetMap avec rues</h3>
      <MapContainer center={centreTana} zoom={13} className="carte-leaflet">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tuileLocale}
          maxZoom={18}
          minZoom={10}
        />
        {onClicCarte && <GestionnaireClicCarte onClicCarte={onClicCarte} />}
        {marqueurs.map((s) => (
          <Marker key={s.id_signalement} position={[Number(s.latitude), Number(s.longitude)]} icon={icone}>
            <Popup>
              <strong>{s.titre_signalement}</strong>
              <br />{s.description_signalement}
              <br />Statut: {s.libelle_statut}
              <br />Gravité: {s.niveau_gravite}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CarteTana;
