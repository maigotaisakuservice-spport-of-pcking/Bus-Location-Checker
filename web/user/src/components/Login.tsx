import React, { useState } from 'react';
import { decodeInviteCode, encrypt } from '../lib/encryption';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface LoginProps {
  onLogin: (busId: string, key: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentClass, setParentClass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { busId, key } = decodeInviteCode(code);
      if (!busId || !key) throw new Error();

      // Register parent info (encrypted)
      await addDoc(collection(db, 'users'), {
        busId,
        encryptedName: encrypt(parentName, key),
        encryptedClass: encrypt(parentClass, key),
        createdAt: serverTimestamp()
      });

      onLogin(busId, key);
    } catch (err) {
      setError('招待コードが正しくないか、入力内容に不備があります。');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">バス位置確認 ログイン</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">招待コード</label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">保護者名</label>
          <input
            type="text"
            required
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">クラス名</label>
          <input
            type="text"
            required
            value={parentClass}
            onChange={(e) => setParentClass(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          地図を表示する
        </button>
      </form>
    </div>
  );
};

export default Login;
