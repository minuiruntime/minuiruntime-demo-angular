/**
 * StreamingRenderer class that wraps the MinUIRuntime WASM engine
 * for real-time SSR and incremental HTML generation
 */
export class StreamingRenderer {
  // Session for demo/debugging - initialized after WASM loads
  private session: any = null;
  private renderer: any = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private patchCount: number = 0;

  constructor() {
    console.log('StreamingRenderer initializing...');
    this.initPromise = this.initRenderer();
  }

  /**
   * Initialize the WASM streaming renderer
   */
  private async initRenderer(): Promise<void> {
    try {
      console.log('Loading MinUiRuntime WASM from npm package...');
      // Import from the npm package @minuiruntime/minui_rt
      const wasmModule = await import('@minuiruntime/minui_rt');
      console.log('WASM module loaded, initializing...');
      
      // Initialize the WASM module with the path where Angular copies it
      await wasmModule.default('/assets/wasm/minui_rt_bg.wasm');
      console.log('WASM initialized, creating streaming renderer...');
      
      // Small delay to ensure WASM is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create WasmStreamingRenderer instance
      this.renderer = new wasmModule.WasmStreamingRenderer();
      
      // Verify renderer was created successfully
      if (!this.renderer) {
        throw new Error('Failed to create WasmStreamingRenderer instance');
      }
      
      // Test that the renderer methods are available
      try {
        const testHtml = this.renderer.html();
        console.log('Renderer verification successful, initial HTML:', testHtml);
      } catch (e) {
        throw new Error(`Renderer methods not available: ${e}`);
      }
      
      // Create session for demo/debugging
      this.session = new wasmModule.WasmStreamingRenderer();
      console.log('Session created:', this.session);
      
      this.initialized = true;
      console.log('MinUIRuntime WASM streaming renderer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize streaming renderer:', error);
      this.initialized = false;
      throw error;
    }
  }

  /**
   * Wait for renderer to be initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      await this.initPromise;
    }
    
    if (!this.initialized) {
      throw new Error('Streaming renderer initialization failed');
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
      
      if (!this.renderer) {
        throw new Error('Streaming renderer not initialized');
      }

      console.log('Processing fragment:', jsonFragment.substring(0, 100));
      
      // feed_json returns a StreamResult object with html and error properties
      const result = this.renderer.feed_json(jsonFragment);
      
      // Safely check for errors - the result might not be fully initialized
      if (!result) {
        console.error('WASM renderer returned null/undefined result');
        return `<!-- Error: Invalid result from WASM renderer -->`;
      }
      
      // Check for errors using try-catch in case the getter fails
      let hasError = false;
      let errorDetails = null;
      try {
        hasError = result.hasError;
        if (hasError) {
          errorDetails = result.error;
        }
      } catch (e) {
        console.error('Error accessing result properties:', e);
        // Return the HTML anyway if available
        try {
          return result.html || `<!-- Error accessing result: ${e} -->`;
        } catch {
          return `<!-- Critical error: Cannot access result properties -->`;
        }
      }
      
      if (hasError && errorDetails) {
        const errorMsg = `${errorDetails.kind}: ${errorDetails.message}`;
        console.error('WASM renderer error:', errorMsg);
        if (errorDetails.offendingChunk) {
          console.error('Offending chunk:', errorDetails.offendingChunk);
        }
        return `<!-- Error: ${errorMsg} -->`;
      }
      
      // Update patch count
      this.patchCount = this.renderer.patches_applied();
      
      // Get the HTML from the result
      const html = result.html;
      console.log(`Generated HTML (${this.patchCount} patches applied):`, html.substring(0, 100));
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
    if (!this.renderer) return 0;
    return this.renderer.patches_applied();
  }

  /**
   * Get the accumulated HTML buffer
   */
  getBuffer(): string {
    if (!this.renderer) return '';
    return this.renderer.html();
  }

  /**
   * Reset the renderer state
   */
  reset(): void {
    if (this.renderer) {
      this.renderer.reset();
      this.patchCount = 0;
    }
  }
}
