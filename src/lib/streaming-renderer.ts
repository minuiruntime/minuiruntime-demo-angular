/**
 * StreamingRenderer class that wraps the MinUIRuntime WASM engine
 * for real-time SSR and incremental HTML generation
 */
export class StreamingRenderer {
  // Streaming session - initialized after WASM loads
  private session: any = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private currentPatchCount: number = 0;

  constructor() {
    console.log('StreamingRenderer initializing...');
    this.initPromise = this.initRenderer();
  }

  /**
   * Initialize the WASM streaming renderer using createStreamingSession
   */
  private async initRenderer(): Promise<void> {
    try {
      console.log('Loading MinUiRuntime WASM from npm package...');
      // Import from the npm package @minuiruntime/minui_rt
      const wasmModule = await import('@minuiruntime/minui_rt');
      console.log('WASM module loaded, initializing with custom path...');
      
      // Initialize WASM with explicit path where Angular copies it
      const initFn = wasmModule.default;
      if (typeof initFn === 'function') {
        await initFn('/assets/wasm/minui_rt_bg.wasm');
        console.log('WASM initialized successfully');
      }
      
      const MinUiRuntime = wasmModule.MinUiRuntime;
      if (!MinUiRuntime) {
        throw new Error('MinUiRuntime class not found in module');
      }
      
      console.log('Creating streaming session...');
      
      // Create streaming session using static method
      // Enable debug for demo sessions only
      this.session = MinUiRuntime.createStreamingSession({
        mode: "auto", // "auto" | "json" | "ai"
        debug: true,
      });
      
      // Verify session was created successfully
      if (!this.session) {
        throw new Error('Failed to create streaming session');
      }
      
      this.initialized = true;
      this.currentPatchCount = 0;
      console.log('MinUIRuntime WASM streaming session initialized successfully');
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
   * Handle an incoming chunk (JSON or AI text)
   * 
   * Precondition: session must be initialized via createStreamingSession()
   * 
   * @param {string|object} chunk - Input data (JSON string/object or AI text)
   * @returns {string} The resulting HTML
   */
  async processFragment(chunk: string | object): Promise<string> {
    try {
      await this.ensureInitialized();
      
      // Invariant check: session must be initialized
      if (!this.session) {
        const error = new Error("StreamingSession not initialized. Call createStreamingSession() first.");
        console.error(`❌ ${error.message}`);
        throw error;
      }

      // Convert object to string if needed
      const input = typeof chunk === 'string' ? chunk : JSON.stringify(chunk);
      console.log('Processing chunk:', input.substring(0, 100));
      
      // Update session with chunk (auto-detects JSON vs AI based on mode)
      // Returns a Frame object with html, patchesApplied, and diagnostics
      const frame = this.session.update(input);
      
      // Update total patch count
      this.currentPatchCount = frame.patchesApplied;
      
      // Log diagnostics if available
      if (frame.diagnostics) {
        const delta = frame.diagnostics.patchCountDelta ?? 0;
        console.log(`  └─ Patches: ${frame.patchesApplied} (Δ +${delta})`);
        
        // Log any errors
        if (frame.diagnostics.error) {
          console.error('Frame error:', frame.diagnostics.error);
        }
      }
      
      return frame.html;
    } catch (error) {
      const errorMsg = `❌ Error processing chunk: ${error}`;
      console.error(errorMsg);
      throw error;
    }
  }

  /**
   * Get the current patch count from the last frame
   */
  getPatchCount(): number {
    return this.currentPatchCount;
  }

  /**
   * Get the accumulated HTML buffer
   */
  getBuffer(): string {
    if (!this.session) return '';
    try {
      return this.session.html();
    } catch (error) {
      console.error('Error getting HTML buffer:', error);
      return '';
    }
  }

  /**
   * Reset the renderer state by creating a new session
   */
  async reset(): Promise<void> {
    if (this.session) {
      try {
        // Reset the existing session
        this.session.reset();
        this.currentPatchCount = 0;
        console.log('Session reset successfully');
      } catch (error) {
        console.error('Error resetting session, reinitializing:', error);
        // If reset fails, re-create the session
        this.initialized = false;
        this.session = null;
        this.currentPatchCount = 0;
        await this.initRenderer();
      }
    }
  }
}
