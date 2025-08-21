import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    // Keep the SDK out of SSR bundle resolution to avoid client chunking conflicts
    external: ['openai']
  },
  build: {
    rollupOptions: {
      output: {
        // Intentionally no manualChunks that reference 'openai'
      }
    }
  }
});
