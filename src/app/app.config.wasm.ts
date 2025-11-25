/**
 * WASM configuration for cache busting
 * Update WASM_VERSION when the WASM file changes to force browsers to reload it
 */
export const WASM_CONFIG = {
  // Version should match the package version or be updated manually
  version: '0.3.0',
  path: 'assets/wasm/minui_rt_bg.wasm',
} as const;

/**
 * Get the WASM URL with cache busting version parameter
 */
export function getWasmUrl(): string {
  return `${WASM_CONFIG.path}?v=${WASM_CONFIG.version}`;
}
