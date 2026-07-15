importScripts(
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "New Order";
  const options = {
    body: payload?.notification?.body || "New order received in kitchen",
    icon: "/logo192.png",
    badge: "/logo192.png",
    tag: payload?.data?.orderId || "new-order",
    requireInteraction: true,
    vibrate: [300, 100, 300],
    data: {
      url: payload?.data?.url || "/cook-dashboard?tab=Pending",
    },
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/cook-dashboard?tab=Pending";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
