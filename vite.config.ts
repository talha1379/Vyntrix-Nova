import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwind from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// Minimal Vite config.
// If you relied on additional integrations from previous presets, add them here.
export default defineConfig({
  plugins: [tanstackStart(), tailwind(), react()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    // keep usual defaults; adjust if your dev environment requires specific host/port
  },
  build: {
    // Use the app's client entry as a fallback input so Vite can build without an index.html
    rollupOptions: {
      input: "src/start.ts",
    },
  },
});
