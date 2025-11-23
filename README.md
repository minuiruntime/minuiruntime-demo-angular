# minuiruntime-demo-angular

Official Angular demo showcasing **real-time AI UI streaming** using the **MinUiRuntime WebAssembly engine**.  
This example demonstrates how JSON fragments stream into the `WasmStreamingRenderer` to produce **incremental HTML updates** — enabling fast, deterministic SSR-style rendering powered by Rust/WASM.

---

## 🚀 Features

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

The app reloads automatically as you modify files.

---

## 🧠 How It Works

### **1. WasmStreamingRenderer**  
Located at:

```
src/app/streaming/streaming-renderer.ts
```

Loads the MinUiRuntime WebAssembly module and processes streamed JSON fragments.

### **2. StreamingService**  
Located at:

```
src/app/services/streaming.service.ts
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

## 🧩 Minimal Example Usage

```ts
import { WasmStreamingRenderer } from "@minuiruntime/minui_rt";

async function example() {
  const renderer = new WasmStreamingRenderer();

  const jsonFrame = {
    tag: "div",
    children: [
      { tag: "p", text: "Hello from MinUiRuntime!" }
    ]
  };

  const result = renderer.feed_json(jsonFrame);

  console.log("HTML:", result.html);
  console.log("Patches:", result.patches);
}
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── app.component.ts
│   ├── app.component.html
│   └── app.component.css
├── streaming/
│   └── streaming-renderer.ts     # WASM-backed renderer
├── services/
│   └── streaming.service.ts     # JSON generator for demo
└── assets/
    └── wasm/                    # minui_rt_bg.wasm
```

---

## 📝 License
MIT License. See the `LICENSE` file for details.
