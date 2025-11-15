/**
 * StreamingRenderer class that wraps the MinUIRuntime WASM engine
 * for real-time SSR and incremental HTML generation
 */
export class StreamingRenderer {
  private wasmRenderer: any = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    console.log('StreamingRenderer initializing...');
    this.initPromise = this.initWasm();
  }

  /**
   * Initialize the WASM module
   */
  private async initWasm(): Promise<void> {
    try {
      console.log('Loading WASM module...');
      // Use dynamic import to load the WASM module
      const wasmModule = await import('../assets/wasm/minui_rt.js');
      console.log('WASM module loaded, initializing...');
      
      // Initialize the WASM module with the correct path
      await wasmModule.default('/assets/wasm/minui_rt_bg.wasm');
      console.log('WASM initialized, creating renderer...');
      
      this.wasmRenderer = new wasmModule.WasmStreamingRenderer();
      this.initialized = true;
      console.log('MinUIRuntime WASM initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WASM:', error);
      this.initialized = false;
      throw error;
    }
  }

  /**
   * Wait for WASM to be initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      await this.initPromise;
    }
    
    if (!this.initialized) {
      throw new Error('WASM initialization failed');
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

      console.log('Processing fragment:', jsonFragment.substring(0, 100));
      
      // Use feed_json for strict schema-compliant JSON
      const html = this.wasmRenderer.feed_json(jsonFragment);
      console.log('Generated HTML:', html);
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
