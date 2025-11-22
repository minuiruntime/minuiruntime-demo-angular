// Polyfill for performance.now() in Node
if (typeof performance === 'undefined' && typeof globalThis !== 'undefined') {
  (globalThis as any).performance = {
    now: () => {
      // Fallback implementation for Node.js environment
      return Date.now();
    }
  };
}

// Mock DomSanitizer for unit tests
export class MockDomSanitizer {
  bypassSecurityTrustHtml(value: string): string {
    return value;
  }
}
