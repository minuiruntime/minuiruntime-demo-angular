import initWasm, { MinUiRuntime } from "@minuiruntime/minui_rt";
import { getWasmUrl } from '../app/app.config.wasm';

// Global WASM initialization tracking
let wasmInitialized = false;
let wasmInitPromise: Promise<void> | null = null;

/**
 * Ensure WASM is initialized only once globally
 */
async function ensureWasmInit(): Promise<void> {
  if (wasmInitialized) {
    return;
  }
  
  if (wasmInitPromise) {
    return wasmInitPromise;
  }
  
  wasmInitPromise = (async () => {
    try {
      console.log("Initializing MinUiRuntime WASM (global)...");
      await initWasm(getWasmUrl());
      wasmInitialized = true;
      console.log("MinUiRuntime WASM initialized (global).");
    } catch (err) {
      console.error("Failed to initialize WASM:", err);
      wasmInitPromise = null; // Allow retry
      throw err;
    }
  })();
  
  return wasmInitPromise;
}

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
  private isProcessing: boolean = false;
  private processingQueue: Promise<any> = Promise.resolve();

  constructor() {
    console.log('StreamingRenderer initializing...');
    this.initPromise = this.initRenderer();
  }

  /**
   * Initialize the WASM streaming renderer using createStreamingSession
   */
  private async initRenderer(): Promise<void> {
    try {
      // Use global WASM initialization
      await ensureWasmInit();

      console.log("Creating new streaming session...");
      this.session = MinUiRuntime.createStreamingSession({ mode: "auto" });

      this.initialized = true;
      this.currentPatchCount = 0;
      this.processingQueue = Promise.resolve();

      console.log("StreamingRenderer session created.");
    } catch (err) {
      console.error("Failed to initialize StreamingRenderer:", err);
      this.initialized = false;
      throw err;
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
    // Queue this operation to prevent concurrent access
    return this.processingQueue = this.processingQueue.then(async () => {
      try {
        await this.ensureInitialized();
        
        // Capture session reference to avoid using a replaced session
        const currentSession = this.session;
        
        // Invariant check: session must be initialized
        if (!currentSession) {
          const error = new Error("StreamingSession not initialized. Call createStreamingSession() first.");
          console.error(`❌ ${error.message}`);
          throw error;
        }

        // Convert object to string if needed
        const input = typeof chunk === 'string' ? chunk : JSON.stringify(chunk);
        console.log('Processing chunk:', input.substring(0, 100));
        
        // Verify session hasn't changed mid-operation
        if (this.session !== currentSession) {
          console.warn('Session was replaced during processing, skipping chunk');
          return '';
        }
        
        // Update session with chunk (auto-detects JSON vs AI based on mode)
        // Returns a Frame object with html, patchesApplied, and diagnostics
        const frame = currentSession.update(input);
        
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
    });
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
   * Reset the streaming session to start fresh
   * This prevents state corruption between streaming runs
   */
  async reset(): Promise<void> {
    // Wait for any pending operations to complete before resetting
    await this.processingQueue.catch(() => {});
    
    try {
      await this.ensureInitialized();
      
      console.log('Resetting streaming session...');
      
      // Clear the old session reference
      this.session = null;
      
      // Reset the processing queue
      this.processingQueue = Promise.resolve();
      
      // Create a fresh session
      this.session = MinUiRuntime.createStreamingSession({ mode: "auto" });
      this.currentPatchCount = 0;
      
      console.log('Streaming session reset complete.');
    } catch (error) {
      console.error('Failed to reset streaming session:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    // Wait for pending operations
    await this.processingQueue.catch(() => {});
    
    console.log('Cleaning up StreamingRenderer...');
    this.session = null;
    this.initialized = false;
    this.processingQueue = Promise.resolve();
  }
}
