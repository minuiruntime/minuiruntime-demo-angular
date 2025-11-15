// Polyfill for performance.now() in Node
if (typeof performance === 'undefined') {
  (global as any).performance = {
    now: () => {
      const [seconds, nanoseconds] = process.hrtime();
      return seconds * 1000 + nanoseconds / 1000000;
    }
  };
}

// Mock DomSanitizer for unit tests
export class MockDomSanitizer {
  bypassSecurityTrustHtml(value: string): string {
    return value;
  }
}
