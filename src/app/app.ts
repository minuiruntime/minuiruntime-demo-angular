import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StreamingService } from '../services/streaming.service';
import { Subscription } from 'rxjs';
import { MinUiRuntime } from '@minuiruntime/minui_rt';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  // Made public for testing - in production would be protected
  public readonly title = signal('MinUiRuntime Angular Demo');
  public readonly isStreaming = signal(false);
  public readonly patchCount = signal(0);
  public readonly htmlContent = signal<SafeHtml>('');
  
  // JSON editor signals
  public readonly jsonInput = signal<string>(this.getDefaultJson());
  public readonly renderedOutput = signal<SafeHtml>('');
  public readonly renderError = signal<string>('');
  
  private streamSubscription?: Subscription;
  private autoStopTimeout?: any;
  private readonly AUTO_STOP_DURATION = 2 * 60 * 1000; // 2 minutes

  constructor(
    private streamingService: StreamingService,
    private sanitizer: DomSanitizer
  ) {
    // WASM is initialized globally by StreamingRenderer
  }

  private getDefaultJson(): string {
    const defaultObj = {
      version: "1.0",
      type: "element",
      tag: "div",
      attrs: { class: "message" },
      children: [
        { type: "text", value: "Hello from MinUI Runtime!" }
      ]
    };
    return JSON.stringify(defaultObj, null, 2);
  }

  renderJson(): void {
    this.renderError.set('');
    this.renderedOutput.set('');

    try {
      // Parse JSON to validate it
      const jsonObj = JSON.parse(this.jsonInput());
      
      // Convert back to string for MinUiRuntime
      const jsonString = JSON.stringify(jsonObj);
      
      // Render directly — returns Frame object
      const frame = MinUiRuntime.render(jsonString);
      
      // Get HTML from frame
      const html = frame.html;
      
      // Sanitize and display
      this.renderedOutput.set(this.sanitizer.bypassSecurityTrustHtml(html));
      
      console.log('Rendered JSON successfully:', html);
    } catch (error: any) {
      this.renderError.set(error.message || 'Failed to render JSON');
      console.error('Render error:', error);
    }
  }

  async startStreaming(): Promise<void> {
    if (this.isStreaming()) {
      console.warn('Streaming already in progress, stopping first...');
      await this.stopStreaming();
      // Small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isStreaming.set(true);
    this.htmlContent.set('');
    this.patchCount.set(0);

    console.log('Starting streaming...');
    
    // Start streaming with 500ms intervals
    let accumulatedHtml = '';
    this.streamSubscription = this.streamingService.startStreaming(500).subscribe({
      next: ({ html, patchCount }) => {
        console.log('Received fragment, patch count:', patchCount);
        accumulatedHtml += html;
        this.htmlContent.set(this.sanitizer.bypassSecurityTrustHtml(accumulatedHtml));
        this.patchCount.set(patchCount);
      },
      error: (error) => {
        console.error('Streaming error:', error);
        alert('Error: ' + error.message);
        this.stopStreaming();
      }
    });

    // Auto-stop after 2 minutes
    this.autoStopTimeout = setTimeout(() => {
      this.stopStreaming();
    }, this.AUTO_STOP_DURATION);
  }

  async stopStreaming(): Promise<void> {
    if (!this.isStreaming()) return;

    this.isStreaming.set(false);
    this.streamingService.stopStreaming();
    
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
      this.streamSubscription = undefined;
    }

    if (this.autoStopTimeout) {
      clearTimeout(this.autoStopTimeout);
      this.autoStopTimeout = undefined;
    }
    
    // Give time for any in-flight operations to complete
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  ngOnDestroy(): void {
    this.stopStreaming();
  }
}
