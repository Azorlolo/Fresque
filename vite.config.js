import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Chemins relatifs : le build fonctionne quel que soit le dossier d'hébergement
  // (GitHub Pages, Netlify, sous-dossier...). Compatible avec le router en mode hash.
  base: './',
})
