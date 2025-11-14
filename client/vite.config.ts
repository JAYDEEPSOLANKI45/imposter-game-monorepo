import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // binds to 0.0.0.0 so ngrok can reach it
    allowedHosts: ["17615cef81c7.ngrok-free.app"],
    hmr: {
      protocol: "wss",
      host: "17615cef81c7.ngrok-free.app",
      port: 443,
    },
  },
});
