import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { generateKey, generateInviteCode, encrypt } from '../lib/encryption';
import { Bus, MapPin, Settings, Plus, LogOut, Copy, Power, PowerOff } from 'lucide-react';
import BusStopMap from './BusStopMap';

interface BusData {
  id: string;
  config: {
    interval: number;
    forceStop: boolean;
  };
  metadata: {
    encryptedRouteName: string;
    encryptedVehicleNumber: string;
  };
  encryptionKey?: string; // Stored locally or in admin-only field
}

const Dashboard: React.FC = () => {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (user) {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setIsAdmin(true);
        } else {
          window.location.href = '/register';
        }
      } else {
        // Handle no user - maybe redirect to login
      }
    };
    checkAdmin();

    const q = query(collection(db, 'buses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const busList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusData));
      setBuses(busList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addBus = async () => {
    const routeName = prompt("路線名を入力してください");
    const vehicleNum = prompt("車両番号を入力してください");
    if (!routeName || !vehicleNum) return;

    const key = generateKey();
    const encryptedRoute = encrypt(routeName, key);
    const encryptedVehicle = encrypt(vehicleNum, key);

    await addDoc(collection(db, 'buses'), {
      config: {
        interval: 30,
        forceStop: false
      },
      metadata: {
        encryptedRouteName: encryptedRoute,
        encryptedVehicleNumber: encryptedVehicle
      },
      encryptionKey: key, // In production, this should be highly protected or derived
      createdAt: serverTimestamp()
    });
  };

  const updateGlobalConfig = async (config: Partial<BusData['config']>) => {
    const promises = buses.map(bus =>
      updateDoc(doc(db, 'buses', bus.id), {
        [`config.${Object.keys(config)[0]}`]: Object.values(config)[0]
      })
    );
    await Promise.all(promises);
    alert('全デバイスに設定を適用しました。');
  };

  if (loading) return <div className="p-8 text-white">読み込み中...</div>;
  if (!isAdmin) return <div className="p-8 text-white">管理者権限がありません。</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bus className="text-blue-500" /> バス位置管理システム
        </h1>
        <button onClick={() => auth.signOut()} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <LogOut size={18} /> ログアウト
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="text-gray-400" /> 一斉コントロール
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => updateGlobalConfig({ forceStop: false })}
                className="w-full bg-green-600 hover:bg-green-700 py-2 rounded flex items-center justify-center gap-2"
              >
                <Power size={18} /> 全デバイス一斉稼働
              </button>
              <button
                onClick={() => updateGlobalConfig({ forceStop: true })}
                className="w-full bg-red-600 hover:bg-red-700 py-2 rounded flex items-center justify-center gap-2"
              >
                <PowerOff size={18} /> 全デバイス一斉停止
              </button>
              <div>
                <label className="block text-sm text-gray-400 mb-1">位置更新間隔 (秒)</label>
                <div className="flex gap-2">
                  <input type="number" id="globalInterval" defaultValue={30} className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-20" />
                  <button
                    onClick={() => {
                      const val = parseInt((document.getElementById('globalInterval') as HTMLInputElement).value);
                      updateGlobalConfig({ interval: val });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm"
                  >
                    適用
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">バス一覧</h2>
              <button onClick={addBus} className="p-1 bg-blue-600 rounded hover:bg-blue-700">
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-96">
              {buses.map(bus => (
                <div key={bus.id} className="p-3 bg-gray-700 rounded border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Bus ID: {bus.id.substring(0, 8)}...</p>
                      <p className="text-xs text-gray-400">更新間隔: {bus.config.interval}秒</p>
                    </div>
                    <button
                      onClick={() => {
                        const code = generateInviteCode(bus.id, bus.encryptionKey || '');
                        navigator.clipboard.writeText(code);
                        alert('招待コードをコピーしました');
                      }}
                      className="text-blue-400 hover:text-blue-300"
                      title="招待コードをコピー"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Map Section */}
        <div className="lg:col-span-2">
          <section className="bg-gray-800 p-6 rounded-lg shadow-lg h-full min-h-[500px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="text-red-500" /> バス停・位置確認
            </h2>
            <div className="flex-grow rounded overflow-hidden relative">
               <BusStopMap buses={buses} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
