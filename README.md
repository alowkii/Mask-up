# 3D AR Face Filter App

Real-time face filter application with 3D accessories built using React, TypeScript, and Three.js.

![React](https://img.shields.io/badge/React-19.1.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue) ![Three.js](https://img.shields.io/badge/Three.js-0.160.0-green)

## Features

- **3D Filters**: Glasses, hats, beards, and mustaches with realistic 3D rendering
- **Real-time Face Tracking**: 68-point facial landmark detection
- **Screenshot Capture**: High-quality photos with filters applied
- **Filter Calibration**: Fine-tune position, rotation, and scale
- **Mobile Responsive**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+
- Modern browser with WebGL support
- Camera access

### Installation

```bash
# Clone repository
git clone https://github.com/alowkii/mask-up
cd maks-up

# Install dependencies
npm install

# Download face detection models
npm run download-models

# Start development server
npm run dev
```

Open `http://localhost:5173` and allow camera access.

## Usage

1. **Select Filters**: Click filter button and choose 3D accessories
2. **Take Screenshots**: Click red camera button to capture photos
3. **Calibrate Filters**: Use gear icon to adjust filter positioning
4. **Debug Mode**: Click bug icon to view face detection landmarks

## Project Structure

```
src/
├── components/          # React components
│   ├── App.tsx
│   ├── Filter3DOverlay.tsx
│   └── WebcamView.tsx
├── hooks/              # Custom hooks
├── utils/              # Utilities and 3D models
├── types/              # TypeScript definitions
└── constants.ts        # Configuration
```

## Development

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
npm run preview      # Preview build
```

## Browser Support

- Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- WebGL and MediaDevices API required
- Not supported: Internet Explorer

## Troubleshooting

**Camera not working**: Check browser permissions, close other camera apps
**Models not loading**: Run `npm run download-models`, check internet connection
**Poor performance**: Close browser tabs, try Chrome, enable performance mode
**Filter alignment**: Use calibration panel, ensure good lighting

## Adding Custom Filters

1. Add 3D model in `src/utils/FilterModels.ts`
2. Configure filter in `src/constants.ts`
3. Add thumbnail in `public/filters/`

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes and test
4. Submit pull request

---

**Built with face-api.js, Three.js, and React**
