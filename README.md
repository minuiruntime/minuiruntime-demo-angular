# minui-demo-angular
Angular demo showcasing real-time AI UI streaming with the MinUIRuntime WebAssembly engine. Simulates a chat interface where JSON fragments stream into the StreamingRenderer for incremental DOM updates, demonstrating MinUIRuntime's real-time SSR and incremental HTML generation.

## Features

- **Real-time Streaming**: Components appear dynamically as JSON fragments are processed
- **Mock WASM Engine**: StreamingRenderer class simulates MinUIRuntime WASM module
- **Multiple Component Types**: Messages, cards, lists, buttons, and text fragments
- **Auto-Stop Timer**: Automatically stops streaming after 2 minutes
- **Live Patch Counter**: Displays the number of incremental updates applied
- **Modern UI**: Clean, responsive design with gradient backgrounds and animations

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
npm test
```

## How It Works

1. **StreamingRenderer** (`src/lib/streaming-renderer.ts`): Mock WASM module that processes JSON fragments and generates HTML components
2. **StreamingService** (`src/services/streaming.service.ts`): Angular service that generates random JSON fragments at 500ms intervals
3. **App Component**: Main UI with Start/Stop controls, status display, and live preview area

The demo simulates real-time AI UI streaming by:
- Generating random JSON fragments with different component types
- Processing each fragment through the StreamingRenderer
- Incrementally updating the DOM with new components
- Tracking patch count and streaming status

## Architecture

```
src/
├── app/
│   ├── app.ts          # Main component with streaming controls
│   ├── app.html        # Template with preview area
│   └── app.css         # Component styles
├── services/
│   └── streaming.service.ts  # JSON fragment generation
└── lib/
    └── streaming-renderer.ts # Mock WASM renderer
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
