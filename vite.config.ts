// PaisaWise — built by Sujay Gopal
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    // TanStack Start (which bundles the router plugin) MUST come before
    // react() — the router transform has to run before JSX compilation.
    // Nitro defaults to the node-server preset, which is what Railway needs.
    tanstackStart({ server: { entry: "server" } }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
  // 'pg' is a Node-only driver — never let it get bundled into client code.
  ssr: {
    external: ["pg"],
  },
});
