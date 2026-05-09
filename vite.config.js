import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    minify: 'terser',         // Maximum JS minification
    cssMinify: true,
    rollupOptions: {
      output: {
        // Hashed filenames so cached copies break on every deploy
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[chunk].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      }
    }
  }
})
