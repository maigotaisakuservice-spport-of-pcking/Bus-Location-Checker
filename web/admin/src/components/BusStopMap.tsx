import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { encrypt, decrypt } from '../lib/encryption';

// Fix for leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface BusStop {
  id: string;
  busId: string;
  encryptedName: string;
  location: { lat: number, lng: number };
}

interface BusStopMapProps {
  buses: any[];
}

const BusStopMap: React.FC<BusStopMapProps> = ({ buses }) => {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('');

  useEffect(() => {
    if (buses.length > 0 && !selectedBusId) {
      setSelectedBusId(buses[0].id);
    }

    const q = query(collection(db, 'busStops'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stopList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusStop));
      setStops(stopList);
    });

    return () => unsubscribe();
  }, [buses]);

  const MapEvents = () => {
    useMapEvents({
      click: async (e) => {
        if (!selectedBusId) {
          alert("バスを選択してからクリックしてください");
          return;
        }
        const name = prompt("バス停名を入力してください");
        if (!name) return;

        const bus = buses.find(b => b.id === selectedBusId);
        if (!bus) return;

        const encryptedName = encrypt(name, bus.encryptionKey);
        const encryptedLocation = encrypt(`${e.latlng.lat},${e.latlng.lng}`, bus.encryptionKey);

        await addDoc(collection(db, 'busStops'), {
          busId: selectedBusId,
          encryptedName: encryptedName,
          encryptedLocation: encryptedLocation
        });
      },
    });
    return null;
  };

  const deleteStop = async (id: string) => {
    if (window.confirm("このバス停を削除しますか？")) {
      await deleteDoc(doc(db, 'busStops', id));
    }
  };

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-2 left-12 z-[1000] bg-white p-2 rounded shadow text-black">
        <label className="text-xs font-bold block mb-1">バス停を追加する路線:</label>
        <select
          value={selectedBusId}
          onChange={(e) => setSelectedBusId(e.target.value)}
          className="text-sm border rounded"
        >
          {buses.map(b => (
            <option key={b.id} value={b.id}>Bus {b.id.substring(0,5)}</option>
          ))}
        </select>
        <p className="text-[10px] mt-1 text-gray-500">地図クリックでバス停追加</p>
      </div>

      <MapContainer center={[35.6812, 139.7671]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents />
        {stops.map(stop => {
          const bus = buses.find(b => b.id === stop.busId);
          if (!bus) return null;
          const decryptedName = decrypt(stop.encryptedName, bus.encryptionKey);
          const decryptedLoc = decrypt(stop.encryptedLocation, bus.encryptionKey);
          const [lat, lng] = decryptedLoc.split(',').map(Number);

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={stop.id} position={[lat, lng]}>
              <Popup>
                <div className="text-black">
                  <p className="font-bold">{decryptedName}</p>
                  <p className="text-xs text-gray-500">所属バス: {stop.busId.substring(0,8)}</p>
                  <button
                    onClick={() => deleteStop(stop.id)}
                    className="mt-2 text-red-500 text-xs hover:underline"
                  >
                    削除
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default BusStopMap;
