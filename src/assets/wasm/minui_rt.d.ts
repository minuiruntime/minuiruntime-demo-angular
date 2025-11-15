/* tslint:disable */
/* eslint-disable */
/**
 * Compares two JSON UI snapshots and returns HTML with visual diff annotations.
 *
 * This function:
 * 1. Parses both JSON inputs into VNode trees
 * 2. Computes the diff between them
 * 3. Generates HTML with inline `<span>` tags for visual highlighting:
 *    - `<span class="ins">` for insertions
 *    - `<span class="del">` for deletions
 *    - `<span class="chg">` for changes
 * 4. Verifies convergence by re-rendering v2 and confirming 0 patches
 *
 * # Usage (in JS)
 * ```js
 * import init, { diff_html } from "@minuiruntime/core";
 * const diffHtml = diff_html(v1Json, v2Json);
 * ```
 *
 * # Returns
 * A JSON string containing:
 * - `v1_html`: Original v1 rendered
 * - `v2_html`: Target v2 rendered
 * - `diff_html`: v1 with diff annotations
 * - `patches`: Array of patch operations
 * - `converged`: Boolean indicating if re-diffing produces 0 patches
 */
export function diff_html(a_json: string, b_json: string): string;
/**
 * Exports the render() function to JavaScript.
 * 
 * Usage (in JS):
 * ```js
 * import init, { render } from "@minuiruntime/core";
 * const html = render(jsonString);
 * document.body.innerHTML = html;
 * ```
 */
export function render(json: string): string;
export class WasmStreamingRenderer {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get the total number of patches applied so far
   */
  patches_applied(): number;
  constructor();
  /**
   * Get the current HTML snapshot
   */
  html(): string;
  /**
   * Reset the internal state to an empty root
   */
  reset(): void;
  /**
   * Feed an AI JSON or text blob. Auto-detects model and applies incremental patches.
   * Returns the latest HTML snapshot after applying patches, or an HTML comment with the error.
   */
  feed_ai(output: string): string;
  /**
   * Feed strict runtime JSON (must conform to schema). Applies patches and returns HTML.
   */
  feed_json(json: string): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmstreamingrenderer_free: (a: number, b: number) => void;
  readonly diff_html: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly render: (a: number, b: number) => [number, number];
  readonly wasmstreamingrenderer_feed_ai: (a: number, b: number, c: number) => [number, number];
  readonly wasmstreamingrenderer_feed_json: (a: number, b: number, c: number) => [number, number];
  readonly wasmstreamingrenderer_html: (a: number) => [number, number];
  readonly wasmstreamingrenderer_new: () => number;
  readonly wasmstreamingrenderer_patches_applied: (a: number) => number;
  readonly wasmstreamingrenderer_reset: (a: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
