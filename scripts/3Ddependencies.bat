#!/bin/bash

echo "🚀 Installing 3D AR dependencies..."

# Install Three.js and types
npm install three@^0.160.0 @types/three@^0.160.0

echo "✅ Three.js installed successfully!"

# Update vite.config.ts to optimize Three.js
echo "🔧 Updating Vite configuration for Three.js..."

cat > vite.config.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: true, // Make development server accessible on local network
  },
  optimizeDeps: {
    exclude: ["face-api.js"], // Prevent optimization issues with face-api.js
    include: ["three"], // Pre-bundle Three.js for better performance
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "face-api": ["face-api.js"],
          "three": ["three"],
        },
      },
    },
  },
  define: {
    // Fix for Three.js in production builds
    global: 'globalThis',
  },
});
EOF

echo "✅ Vite configuration updated!"

echo ""
echo "🎯 3D AR Setup Complete!"
echo ""
echo "Next steps:"
echo "1. npm run dev - Start the development server"
echo "2. Open your browser and allow camera access"
echo "3. Try the 3D filters!"
echo ""
echo "Features added:"
echo "• ✨ 3D glasses with realistic materials"
echo "• 🎩 3D hat with proper positioning"
echo "• 🧔 3D beard with hair texture"
echo "• 👨 3D mustache with curved shape"
echo "• 💡 Dynamic lighting and shadows"
echo "• 🔄 Real-time 3D tracking"
echo "• 📸 3D-aware screenshots"