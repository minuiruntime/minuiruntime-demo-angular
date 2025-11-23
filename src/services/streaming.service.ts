import { Injectable } from '@angular/core';
import { Observable, interval, Subject, from } from 'rxjs';
import { takeUntil, map, switchMap } from 'rxjs/operators';
import { StreamingRenderer } from '../lib/streaming-renderer';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {
  private renderer: StreamingRenderer;
  private stopSubject = new Subject<void>();
  
  constructor() {
    this.renderer = new StreamingRenderer();
  }

  /**
   * Generate random JSON fragments
   */
  private generateRandomFragment(): string {
    const types = ['message', 'card', 'list', 'button', 'text'];
    const type = types[Math.floor(Math.random() * types.length)];

    const authors = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'AI Assistant', 'System'];
    const titles = ['Update', 'Notification', 'Alert', 'Info', 'News', 'Announcement'];
    const contents = [
      'This is a streaming message demonstrating real-time UI updates.',
      'The MinUI Runtime processes JSON fragments incrementally.',
      'Each fragment is converted to HTML by the WASM engine.',
      'Watch as components appear in real-time!',
      'This showcases the power of streaming SSR.',
      'Components are rendered as data arrives.',
      'No full page reloads needed!',
      'Efficient incremental DOM updates.',
    ];
    const items = [
      'Feature A enabled',
      'Feature B processing',
      'Feature C completed',
      'Feature D pending',
      'Feature E in queue'
    ];

    // Generate MinUI-compatible VNode structure
    switch (type) {
      case 'message':
        return JSON.stringify({
          type: 'element',
          tag: 'div',
          attrs: { class: 'message-box' },
          children: [
            {
              type: 'element',
              tag: 'div',
              attrs: { class: 'message-header' },
              children: [
                {
                  type: 'text',
                  value: authors[Math.floor(Math.random() * authors.length)]
                }
              ]
            },
            {
              type: 'element',
              tag: 'div',
              attrs: { class: 'message-content' },
              children: [
                {
                  type: 'text',
                  value: contents[Math.floor(Math.random() * contents.length)]
                }
              ]
            }
          ]
        });

      case 'card':
        return JSON.stringify({
          type: 'element',
          tag: 'div',
          attrs: { class: 'card-component' },
          children: [
            {
              type: 'element',
              tag: 'h3',
              attrs: { class: 'card-title' },
              children: [
                {
                  type: 'text',
                  value: titles[Math.floor(Math.random() * titles.length)]
                }
              ]
            },
            {
              type: 'element',
              tag: 'p',
              attrs: { class: 'card-body' },
              children: [
                {
                  type: 'text',
                  value: contents[Math.floor(Math.random() * contents.length)]
                }
              ]
            }
          ]
        });

      case 'list':
        const numItems = Math.floor(Math.random() * 3) + 2;
        const selectedItems = [];
        for (let i = 0; i < numItems; i++) {
          selectedItems.push({
            type: 'element',
            tag: 'li',
            attrs: {},
            children: [
              {
                type: 'text',
                value: items[Math.floor(Math.random() * items.length)]
              }
            ]
          });
        }
        return JSON.stringify({
          type: 'element',
          tag: 'ul',
          attrs: { class: 'list-component' },
          children: selectedItems
        });

      case 'button':
        return JSON.stringify({
          type: 'element',
          tag: 'button',
          attrs: { class: 'button-component' },
          children: [
            {
              type: 'text',
              value: ['Click Me', 'Action', 'Submit', 'Next'][Math.floor(Math.random() * 4)]
            }
          ]
        });

      case 'text':
      default:
        return JSON.stringify({
          type: 'element',
          tag: 'p',
          attrs: { class: 'text-fragment' },
          children: [
            {
              type: 'text',
              value: contents[Math.floor(Math.random() * contents.length)]
            }
          ]
        });
    }
  }

  /**
   * Start streaming JSON fragments
   * @param intervalMs - Interval between fragments in milliseconds
   * @returns Observable of HTML strings
   */
  startStreaming(intervalMs: number = 500): Observable<{ html: string; patchCount: number }> {
    this.stopSubject = new Subject<void>();

    return interval(intervalMs).pipe(
      takeUntil(this.stopSubject),
      switchMap(async () => {
        const fragment = this.generateRandomFragment();
        const html = await this.renderer.processFragment(fragment);
        const patchCount = this.renderer.getPatchCount();
        return { html, patchCount };
      })
    );
  }

  /**
   * Stop the streaming
   */
  stopStreaming(): void {
    this.stopSubject.next();
    this.stopSubject.complete();
  }

  /**
   * Get the current renderer
   */
  getRenderer(): StreamingRenderer {
    return this.renderer;
  }
}
