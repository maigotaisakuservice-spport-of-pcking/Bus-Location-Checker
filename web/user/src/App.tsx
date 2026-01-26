import { useState, useEffect } from 'react';
import Login from './components/Login';
import MapView from './components/MapView';
import './App.css';

function App() {
  const [authData, setAuthData] = useState<{ busId: string; key: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bus_auth');
    if (saved) {
      setAuthData(JSON.parse(saved));
    }
  }, []);

  const handleLogin = (busId: string, key: string) => {
    const data = { busId, key };
    setAuthData(data);
    localStorage.setItem('bus_auth', JSON.stringify(data));
  };

  const handleLogout = () => {
    setAuthData(null);
    localStorage.removeItem('bus_auth');
  };

  return (
    <div className="App min-h-screen bg-gray-900">
      {!authData ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Login onLogin={handleLogin} />
        </div>
      ) : (
        <div className="relative">
          <MapView busId={authData.busId} encryptionKey={authData.key} />
          <button
            onClick={handleLogout}
            className="absolute top-20 right-4 z-[1000] bg-white text-gray-800 px-3 py-1 rounded shadow text-sm hover:bg-gray-100"
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
