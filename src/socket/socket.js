// import { io } from "socket.io-client";

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

// export const socket = io(SOCKET_URL, {
//   autoConnect: false,
//   withCredentials: true,
//   transports: ["websocket", "polling"],
// });

//add tracking
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

const socketOptions = {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
};

/**
 * Protected POS socket
 * Used by Admin, Cashier, Cook dashboards.
 * Uses cookie/JWT auth from backend.
 */
export const socket = io(SOCKET_URL, socketOptions);

/**
 * Public tracking socket
 * Used only for customer order tracking page.
 * No login required.
 * It can only join public tracking rooms like: track-<trackingToken>
 */
export const publicTrackingSocket = io(SOCKET_URL, {
  ...socketOptions,
  autoConnect: false,
  withCredentials: false,
});

/**
 * Connect protected POS socket safely.
 */
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

/**
 * Disconnect protected POS socket safely.
 */
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

/**
 * Connect public tracking socket safely.
 */
export const connectPublicTrackingSocket = () => {
  if (!publicTrackingSocket.connected) {
    publicTrackingSocket.connect();
  }

  return publicTrackingSocket;
};

/**
 * Disconnect public tracking socket safely.
 */
export const disconnectPublicTrackingSocket = () => {
  if (publicTrackingSocket.connected) {
    publicTrackingSocket.disconnect();
  }
};

/**
 * Join customer tracking room.
 */
export const joinPublicTrackingRoom = (trackingToken, callback) => {
  if (!trackingToken) return;

  connectPublicTrackingSocket();

  publicTrackingSocket.emit(
    "join-public-tracking",
    trackingToken,
    typeof callback === "function" ? callback : undefined,
  );
};

/**
 * Leave customer tracking room.
 */
export const leavePublicTrackingRoom = (trackingToken) => {
  if (!trackingToken) return;

  publicTrackingSocket.emit("leave-public-tracking", trackingToken);
};

export default socket;
