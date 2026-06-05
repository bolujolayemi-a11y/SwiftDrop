import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // This ensures exact absolute mapping to your src directory regardless of your workspace setup
      '@': path.resolve(__dirname, './src'),
    },
    // Explicitly tell Vite to evaluate these extensions in order if omitted
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },
});