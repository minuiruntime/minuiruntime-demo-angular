# MinUiRuntime Angular Demo

Official Angular demo showcasing **real-time AI UI streaming** using the **MinUiRuntime WebAssembly engine**.

**🌐 [Live Demo](https://minuiruntime.github.io/minuiruntime-demo-angular/)**

---

## 🎯 About MinUiRuntime

**MinUiRuntime** is a high-performance WebAssembly engine that transforms JSON streams into production-ready HTML with **zero unsafe operations**. Built in Rust, it delivers:

- **🔒 Safe & Deterministic** — No XSS vulnerabilities, predictable output every time
- **⚡ Blazing Fast** — WASM-powered rendering with minimal JavaScript overhead
- **🌊 True Streaming** — Process JSON fragments as they arrive from AI models
- **🎨 Framework Agnostic** — Works with React, Angular, Vue, Svelte, or vanilla JS
- **📦 Tiny Bundle** — Lightweight WASM module (~100KB gzipped)
- **🔧 Zero Config** — Drop-in solution with no build tooling required

Perfect for AI-powered applications that need to render LLM output in real-time while maintaining security and performance.

---

## 🚀 Live Demo Features

- **Real WASM Engine** — uses `@minuiruntime/minui_rt` for JSON → HTML rendering  
- **Streaming Rendering** — incremental patches update the UI in real time  
- **Deterministic Output** — safe, structured, predictable HTML from JSON  
- **Live Patch Counter** — shows how many streaming updates have been applied  
- **Modern Angular UI** — clean preview area with start/stop controls  

---

## 📦 Getting Started

### **Prerequisites**
- Node.js 20+
- npm 10+

### **Install dependencies**

```bash
npm install
```

### **Install MinUiRuntime**

```bash
npm install @minuiruntime/minui_rt
```

### **Start the development server**

```bash
npm start
```

Navigate to:

```
http://localhost:4200
```

---

## 🧠 How It Works

### **1. WasmStreamingRenderer**  
Located at:

```
src/lib/streaming-renderer.ts
```

Loads the MinUiRuntime WebAssembly module and processes streamed JSON fragments.

### **2. StreamingService**  
Located at:

```
src/services/streaming.service.ts
```

Simulates AI output by generating JSON fragments at timed intervals.

### **3. AppComponent**  
Displays:
- streaming HTML output  
- running patch counter  
- start/stop buttons  

### **Flow**
1. JSON fragment generated  
2. Fragment is fed to the WASM engine  
3. Engine returns HTML + patch count  
4. UI updates instantly  

---

## 🧩 Minimal Example Usage (Server Side Include example)

```ts
import init, { MinUiRuntime } from "@minuiruntime/minui_rt";

// Initialize WASM first (required before using the runtime)
await init("/assets/wasm/minui_rt_bg.wasm");
// OR just: await init(); for auto-loading from default path

// This can also be a pure string from the LLM
const jsonString = JSON.stringify({
  version: "1.0",
  model: "gpt-4", // optional
  type: "element",
  tag: "div",
  attrs: { class: "message" },
  children: [
    { type: "text", value: "Hello from MinUI Runtime!" }
  ]
});

// Render directly — returns Frame object
const frame = MinUiRuntime.render(jsonString);

console.log(frame.html);
// → <div class="message">Hello from MinUI Runtime!</div>
```
---
## 🌊 Streaming Usage — Incremental Updates
For AI-powered applications that stream JSON chunks incrementally:

```ts
import init, { MinUiRuntime } from "@minuiruntime/minui_rt";

// Initialize WASM first (required before using the runtime)
await init("/assets/wasm/minui_rt_bg.wasm");

// Create a streaming session with options
const session = MinUiRuntime.createStreamingSession({ mode: "auto" });

// Update session with chunks as they arrive
const chunk = '{"type":"element","tag":"div","children":[{"type":"text","value":"Hello"}]}';
const frame = session.update(chunk);

// Log frame fields to inspect the response
console.log("Frame fields:", {
  html: frame.html,
  patchesApplied: frame.patchesApplied,
  diagnostics: frame.diagnostics
});

// Access the rendered HTML
console.log(frame.html);
// → <div>Hello</div>

// Access diagnostics
const delta = frame.diagnostics?.patchCountDelta ?? 0;
console.log(`Applied ${delta} patches in this update`);

// Continue updating as more chunks arrive
const chunk2 = '{"type":"element","tag":"div","children":[{"type":"text","value":"Hello, World!"}]}';
const frame2 = session.update(chunk2);
console.log(frame2.html);
// → <div>Hello, World!</div>

// Get current HTML at any time
const currentHtml = session.html();

// Reset session to start fresh
session.reset();
```
---

## 📁 Project Structure

```
src/
├── app/
│   ├── app.config.ts
│   ├── app.css
│   ├── app.html
│   ├── app-logic.spec.ts
│   ├── app.routes.ts
│   └── app.ts
├── assets/
│   └── wasm/
│       └── minui_rt_bg.wasm
├── index.html
├── lib/
│   ├── streaming-renderer-logic.spec.ts
│   └── streaming-renderer.ts     # WASM-backed renderer
├── main.ts
├── services/
│   ├── streaming-logic.spec.ts
│   └── streaming.service.ts      # JSON generator for demo
├── styles.css
├── tests/
└── test-setup.ts
```

---

## 🚀 Deployment

### GitHub Pages

This demo is deployed to GitHub Pages from the `/docs` folder.

**To deploy your own:**

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Commit the `/docs` folder to your repository:
   ```bash
   git add docs/
   git commit -m "Build production bundle for GitHub Pages"
   git push
   ```

3. Enable GitHub Pages:
   - Go to repository **Settings** → **Pages**
   - Set **Source** to "Deploy from a branch"
   - Select **main** branch and **/docs** folder
   - Click **Save**

Your demo will be live at: `https://minuiruntime.github.io/minuiruntime-demo-angular/`

---

## 📝 License
MIT License. See the `LICENSE` file for details.
