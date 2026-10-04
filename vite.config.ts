import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwind from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [tanstackStart(), tailwind(), react(), nitro()],
  resolve: {
    tsconfigPaths: true,
  },
});
