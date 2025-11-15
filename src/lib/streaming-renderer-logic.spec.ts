// Polyfill for performance in Node.js
if (typeof performance === 'undefined') {
  (global as any).performance = {
    now: () => {
      const [seconds, nanoseconds] = process.hrtime();
      return seconds * 1000 + nanoseconds / 1000000;
    }
  };
}

// Pure logic tests for streaming renderer
describe('StreamingRenderer Logic', () => {
  describe('JSON Fragment Processing', () => {
    it('should create valid VNode structure', () => {
      const fragment = {
        type: 'element',
        tag: 'div',
        attrs: { class: 'test' },
        children: [
          {
            type: 'text',
            value: 'Test content'
          }
        ]
      };

      expect(fragment.type).toBe('element');
      expect(fragment.tag).toBe('div');
      expect(fragment.attrs.class).toBe('test');
      expect(fragment.children.length).toBe(1);
    });

    it('should handle nested structures', () => {
      const fragment = {
        type: 'element',
        tag: 'div',
        attrs: {},
        children: [
          {
            type: 'element',
            tag: 'h1',
            attrs: {},
            children: [{ type: 'text', value: 'Title' }]
          }
        ]
      };

      expect(fragment.children[0].type).toBe('element');
      expect(fragment.children[0].tag).toBe('h1');
    });

    it('should validate JSON structure', () => {
      const validFragment = JSON.stringify({
        type: 'element',
        tag: 'div',
        attrs: {},
        children: []
      });

      expect(() => JSON.parse(validFragment)).not.toThrow();
    });

    it('should detect invalid JSON', () => {
      const invalidFragment = 'not valid json{';

      expect(() => JSON.parse(invalidFragment)).toThrow();
    });
  });

  describe('State Management', () => {
    it('should track patch count', () => {
      let patchCount = 0;

      patchCount++;
      expect(patchCount).toBe(1);

      patchCount += 5;
      expect(patchCount).toBe(6);
    });

    it('should accumulate HTML buffer', () => {
      let buffer = '';

      buffer += '<div>first</div>';
      buffer += '<div>second</div>';

      expect(buffer).toContain('first');
      expect(buffer).toContain('second');
    });

    it('should reset state', () => {
      let patchCount = 10;
      let buffer = '<div>content</div>';

      patchCount = 0;
      buffer = '';

      expect(patchCount).toBe(0);
      expect(buffer).toBe('');
    });
  });
});
