import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { decrypt } from '../lib/encryption';
import { Bus, MapPin } from 'lucide-react';

// Fix for leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const BusMarkerIcon = L.divIcon({
  html: `<div style="background: white; border-radius: 50%; padding: 5px; border: 2px solid #3b82f6;">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s1-1.33 1-3c0-3.13-2.6-5-6-5H8c-3.4 0-6 1.87-6 5 0 1.67 1 3 1 3h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
         </div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

interface MapViewProps {
  busId: string;
  encryptionKey: string;
}

const MapView: React.FC<MapViewProps> = ({ busId, encryptionKey }) => {
  const [busLocation, setBusLocation] = useState<[number, number] | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Listen to Bus Location
    const unsubBus = onSnapshot(doc(db, 'buses', busId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.status?.encryptedLocation) {
          const decrypted = decrypt(data.status.encryptedLocation, encryptionKey);
          const [lat, lng] = decrypted.split(',').map(Number);
          setBusLocation([lat, lng]);
          setLastUpdate(data.status.updatedAt?.toDate() || null);
        }
        if (data.metadata) {
          setMetadata({
            routeName: decrypt(data.metadata.encryptedRouteName, encryptionKey),
            vehicleNumber: decrypt(data.metadata.encryptedVehicleNumber, encryptionKey)
          });
        }
      }
    });

    // Listen to Bus Stops
    const q = query(collection(db, 'busStops'), where('busId', '==', busId));
    const unsubStops = onSnapshot(q, (snapshot) => {
      const stopList = snapshot.docs.map(doc => {
        const data = doc.data();
        const decryptedLoc = decrypt(data.encryptedLocation, encryptionKey);
        const [lat, lng] = decryptedLoc.split(',').map(Number);
        return {
          id: doc.id,
          name: decrypt(data.encryptedName, encryptionKey),
          location: { lat, lng }
        };
      });
      setStops(stopList);
    });

    return () => { unsubBus(); unsubStops(); };
  }, [busId, encryptionKey]);

  const RecenterMap = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(coords, map.getZoom());
    }, [coords]);
    return null;
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900 text-white">
      <header className="p-4 bg-gray-800 shadow-md z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bus className="text-blue-500" /> {metadata?.routeName || 'バス'}の位置
            </h1>
            <p className="text-xs text-gray-400">車両番号: {metadata?.vehicleNumber || '---'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">最終更新</p>
            <p className="text-sm font-mono">{lastUpdate instanceof Date ? lastUpdate.toLocaleTimeString() : '---'}</p>
          </div>
        </div>
      </header>

      <div className="flex-grow relative">
        <MapContainer center={[35.6812, 139.7671]} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {busLocation && (
            <>
              <Marker position={busLocation} icon={BusMarkerIcon}>
                <Popup>現在のバス位置</Popup>
              </Marker>
              <RecenterMap coords={busLocation} />
            </>
          )}
          {stops.map(stop => (
            <Marker key={stop.id} position={[stop.location.lat, stop.location.lng]}>
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
