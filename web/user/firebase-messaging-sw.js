importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Config from utils.js (hardcoded here because SW can't access window)
firebase.initializeApp({
  apiKey: "AIzaSyD5IZciT8rwHRxTzNvvo3i335ixwVExLTM",
  authDomain: "bus-location-checker-service.firebaseapp.com",
  projectId: "bus-location-checker-service",
  storageBucket: "bus-location-checker-service.firebasestorage.app",
  messagingSenderId: "371379487729",
  appId: "1:371379487729:web:3dd7a10103f33fc683ba50",
  measurementId: "G-GCVHKY0X7F"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/user/icons/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
