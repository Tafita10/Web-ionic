import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './MapComponent.css';

// Corriger les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Fonction pour créer une icône personnalisée basée sur le statut
const createCustomIcon = (couleur) => {
    const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
            <circle cx="12" cy="12" r="10" fill="${couleur}" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="5" fill="white" opacity="0.5"/>
        </svg>
    `;

    return L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 41]
    });
};

// Composant pour centrer la carte sur les signalements
const MapBounds = ({ signalements }) => {
    const map = useMap();

    useEffect(() => {
        if (signalements && signalements.length > 0) {
            const bounds = L.latLngBounds(
                signalements.map(sig => [sig.latitude, sig.longitude])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [signalements, map]);

    return null;
};

const MapComponent = ({ signalements, onSelectSignalement, loading, isPublic = false }) => {
    const [mapKey, setMapKey] = useState(0);

    // Antananarivo center
    const center = [-18.8792, 47.5079];
    const zoom = 12;

    return (
        <div className="map-wrapper">
            {loading && <div className="map-loading">📍 Chargement de la carte...</div>}
            
            <MapContainer
                key={mapKey}
                center={center}
                zoom={zoom}
                className="map-container-leaflet"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {signalements && signalements.map((sig) => (
                    <Marker
                        key={sig.id_signalement}
                        position={[sig.latitude, sig.longitude]}
                        icon={createCustomIcon(sig.code_couleur)}
                    >
                        <Popup className="custom-popup">
                            <div className="popup-content">
                                <h4>{sig.titre_signalement}</h4>
                                <div className="popup-info">
                                    <p><strong>📅 Date:</strong> {new Date(sig.date_signalement).toLocaleDateString('fr-FR')}</p>
                                    <p><strong>🔴 Statut:</strong> <span className="status-tag" style={{ backgroundColor: sig.code_couleur }}>{sig.libelle_statut}</span></p>
                                    <p><strong>⚠️ Gravité:</strong> {sig.niveau_gravite || 'Non défini'}</p>
                                    {sig.surface_endommagee_m2 && (
                                        <p><strong>📏 Surface:</strong> {parseFloat(sig.surface_endommagee_m2).toFixed(2)} m²</p>
                                    )}
                                    {!isPublic && sig.budget_estime_ar && (
                                        <p><strong>💰 Budget:</strong> {(parseFloat(sig.budget_estime_ar) / 1000000).toFixed(1)}M Ar</p>
                                    )}
                                    {sig.nom_entreprise && (
                                        <p><strong>🏢 Entreprise:</strong> {sig.nom_entreprise}</p>
                                    )}
                                    {/* Lien vers les photos */}
                                    {sig.nombre_photos > 0 && sig.photos_urls && sig.photos_urls.length > 0 ? (
                                        <div className="popup-photos">
                                            <strong>📸 Photos ({sig.nombre_photos}):</strong>
                                            <div className="popup-photos-links">
                                                {sig.photos_urls.slice(0, 3).map((url, index) => (
                                                    <a 
                                                        key={index}
                                                        href={url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="photo-link-popup"
                                                        title={`Voir photo ${index + 1}`}
                                                    >
                                                        📷 Photo {index + 1}
                                                    </a>
                                                ))}
                                                {sig.photos_urls.length > 3 && (
                                                    <span className="more-photos">+{sig.photos_urls.length - 3} autres</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : sig.nombre_photos > 0 ? (
                                        <p><strong>📸 Photos:</strong> {sig.nombre_photos} photo(s) - <em>voir détails</em></p>
                                    ) : null}
                                </div>
                                <button 
                                    className="popup-btn"
                                    onClick={() => {
                                        onSelectSignalement(sig.id_signalement);
                                    }}
                                >
                                    Voir plus de détails →
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBounds signalements={signalements} />
            </MapContainer>

            <div className="map-legend">
                <div className="legend-title">Légende</div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FF0000' }}></span>
                    <span>Nouveau</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FFA500' }}></span>
                    <span>En cours</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#00FF00' }}></span>
                    <span>Terminé</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#808080' }}></span>
                    <span>Annulé</span>
                </div>
            </div>
        </div>
    );
};

export default MapComponent;
