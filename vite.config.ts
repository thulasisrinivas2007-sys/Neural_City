import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Sanitize any malformed environment variable keys that may contain URLs in the key name
for (const key of Object.keys(process.env)) {
  if (key.startsWith('VITE_') && (key.includes(':') || key.includes('/') || key.includes('.'))) {
    if (key.includes('supabase.co')) {
      const match = key.match(/https?:\/\/[^\s"']+/);
      if (match) {
        process.env.SUPABASE_URL = match[0];
      }
    }
    delete process.env[key];
  }
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
