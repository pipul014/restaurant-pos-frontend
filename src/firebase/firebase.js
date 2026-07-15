import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import axios from "axios";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const requestFcmPermission = async (userRole = "Cook") => {
  const supported = await isSupported();

  if (!supported) {
    console.log("FCM not supported in this browser");
    return null;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Notification permission denied");
    return null;
  }

  const messaging = getMessaging(app);

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (token) {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/fcm/save-token`,
      {
        token,
        role: userRole,
      },
      {
        withCredentials: true,
      },
    );
  }

  return token;
};

export const listenForegroundMessages = async (onReceive) => {
  const supported = await isSupported();

  if (!supported) return;

  const messaging = getMessaging(app);

  onMessage(messaging, (payload) => {
    onReceive?.(payload);
  });
};
