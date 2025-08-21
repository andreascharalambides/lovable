import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // Single-Page App fallback so client routes work on Surge
      fallback: '200.html'
    }),
    // Disable prerendering so it behaves like a SPA
    prerender: { entries: [] }
  }
};

export default config;
