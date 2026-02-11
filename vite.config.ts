import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: true, // Listen on all local IPs to allow mobile testing
        port: 3000
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    }
});
