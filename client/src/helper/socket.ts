import { io } from "socket.io-client";

// Use Vite env var VITE_SERVER_URL when available so ngrok or remote servers can be targeted.
// Force websocket transport to avoid XHR polling (some adblockers or proxies block polling requests).
// const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
const SERVER_URL ="http://localhost:8080";

export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ["websocket"],
  // optional: increase reconnection attempts/timeouts if needed
  reconnectionAttempts: 5,
});
