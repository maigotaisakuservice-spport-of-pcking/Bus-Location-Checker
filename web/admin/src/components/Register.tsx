import React, { useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const ADMIN_SETUP_KEY = "BUS_ADMIN_2024_SECRET"; // In real world, use env var

const Register: React.FC = () => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (key !== ADMIN_SETUP_KEY) {
      setError('不正なセットアップキーです。');
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Register user as admin in Firestore
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        role: 'admin',
        createdAt: new Date()
      });

      setSuccess(true);
      setError('');
    } catch (err: any) {
      setError('登録に失敗しました: ' + err.message);
    }
  };

  if (success) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-green-500">管理者登録が完了しました！</h2>
        <p className="mt-4 text-white">ダッシュボードへ移動してバスの設定を開始してください。</p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-6 bg-blue-600 px-4 py-2 rounded text-white"
        >
          ホームへ
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-white">管理者初期登録</h2>
      <p className="mb-4 text-gray-400 text-sm">
        このページは最初の管理者を登録するためのものです。登録後はこのファイルを削除またはアクセス不可にしてください。
      </p>

      <div className="mb-4">
        <label className="block text-gray-300 mb-2">セットアップキー</label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          placeholder="管理者用シークレットキーを入力"
        />
      </div>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <button
        onClick={handleRegister}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
      >
        Googleアカウントで管理者登録
      </button>

      <p className="mt-4 text-xs text-gray-500 text-center">
        ※登録にはGoogleアカウントが必要です。電話番号による2段階認証はFirebase Consoleで設定してください。
      </p>
    </div>
  );
};

export default Register;
