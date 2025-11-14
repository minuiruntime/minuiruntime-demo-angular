/**
 * Mock WebAssembly StreamingRenderer class
 * Simulates the MinUIRuntime WASM engine for real-time SSR and incremental HTML generation
 */
export class StreamingRenderer {
  private buffer: string = '';
  private patchCount: number = 0;

  constructor() {
    console.log('StreamingRenderer initialized');
  }

  /**
   * Process a JSON fragment and generate HTML
   * @param jsonFragment - JSON data to process
   * @returns Generated HTML string
   */
  processFragment(jsonFragment: string): string {
    try {
      const data = JSON.parse(jsonFragment);
      this.patchCount++;
      
      // Simulate WASM processing by converting JSON to HTML components
      const html = this.generateHTML(data);
      this.buffer += html;
      
      return html;
    } catch (error) {
      console.error('Error processing fragment:', error);
      return '';
    }
  }

  /**
   * Generate HTML from JSON data
   */
  private generateHTML(data: any): string {
    if (typeof data === 'string') {
      return `<p class="text-fragment">${this.escapeHtml(data)}</p>`;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.generateHTML(item)).join('');
    }

    if (data && typeof data === 'object') {
      if (data.type === 'message') {
        return `<div class="message-box">
          <div class="message-header">${this.escapeHtml(data.author || 'User')}</div>
          <div class="message-content">${this.escapeHtml(data.content || '')}</div>
        </div>`;
      }

      if (data.type === 'card') {
        return `<div class="card-component">
          <h3 class="card-title">${this.escapeHtml(data.title || 'Card')}</h3>
          <p class="card-body">${this.escapeHtml(data.body || '')}</p>
        </div>`;
      }

      if (data.type === 'list') {
        const items = data.items || [];
        return `<ul class="list-component">
          ${items.map((item: string) => `<li>${this.escapeHtml(item)}</li>`).join('')}
        </ul>`;
      }

      if (data.type === 'button') {
        return `<button class="button-component">${this.escapeHtml(data.label || 'Button')}</button>`;
      }

      // Default object rendering
      return `<div class="data-object">${JSON.stringify(data, null, 2)}</div>`;
    }

    return `<span>${this.escapeHtml(String(data))}</span>`;
  }

  /**
   * Get the current patch count
   */
  getPatchCount(): number {
    return this.patchCount;
  }

  /**
   * Get the accumulated HTML buffer
   */
  getBuffer(): string {
    return this.buffer;
  }

  /**
   * Reset the renderer state
   */
  reset(): void {
    this.buffer = '';
    this.patchCount = 0;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
