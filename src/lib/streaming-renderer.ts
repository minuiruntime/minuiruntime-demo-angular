import init, { WasmStreamingRenderer } from '../assets/wasm/minui_rt.js';

/**
 * StreamingRenderer class that wraps the MinUIRuntime WASM engine
 * for real-time SSR and incremental HTML generation
 */
export class StreamingRenderer {
  private wasmRenderer: WasmStreamingRenderer | null = null;
  private initialized: boolean = false;

  constructor() {
    console.log('StreamingRenderer initializing...');
    this.initWasm();
  }

  /**
   * Initialize the WASM module
   */
  private async initWasm(): Promise<void> {
    try {
      // Initialize the WASM module with the correct path
      await init('/assets/wasm/minui_rt_bg.wasm');
      this.wasmRenderer = new WasmStreamingRenderer();
      this.initialized = true;
      console.log('MinUIRuntime WASM initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WASM:', error);
      this.initialized = false;
    }
  }

  /**
   * Wait for WASM to be initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    // Wait for initialization with timeout
    const timeout = 5000;
    const start = Date.now();
    while (!this.initialized && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!this.initialized) {
      throw new Error('WASM initialization timeout');
    }
  }

  /**
   * Process a JSON fragment and generate HTML
   * @param jsonFragment - JSON data to process
   * @returns Generated HTML string
   */
  async processFragment(jsonFragment: string): Promise<string> {
    try {
      await this.ensureInitialized();
      
      if (!this.wasmRenderer) {
        throw new Error('WASM renderer not initialized');
      }

      // Use feed_ai for flexible JSON parsing (handles both strict and AI-like JSON)
      const html = this.wasmRenderer.feed_ai(jsonFragment);
      return html;
    } catch (error) {
      console.error('Error processing fragment:', error);
      return `<!-- Error: ${error} -->`;
    }
  }

  /**
   * Get the current patch count
   */
  getPatchCount(): number {
    if (!this.wasmRenderer) return 0;
    return this.wasmRenderer.patches_applied();
  }

  /**
   * Get the accumulated HTML buffer
   */
  getBuffer(): string {
    if (!this.wasmRenderer) return '';
    return this.wasmRenderer.html();
  }

  /**
   * Reset the renderer state
   */
  reset(): void {
    if (this.wasmRenderer) {
      this.wasmRenderer.reset();
    }
  }
}
