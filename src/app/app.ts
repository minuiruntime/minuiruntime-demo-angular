import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StreamingService } from '../services/streaming.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  // Made public for testing - in production would be protected
  public readonly title = signal('MinUI Demo');
  public readonly isStreaming = signal(false);
  public readonly patchCount = signal(0);
  public readonly htmlContent = signal<SafeHtml>('');
  
  private streamSubscription?: Subscription;
  private autoStopTimeout?: any;
  private readonly AUTO_STOP_DURATION = 2 * 60 * 1000; // 2 minutes

  constructor(
    private streamingService: StreamingService,
    private sanitizer: DomSanitizer
  ) {}

  startStreaming(): void {
    if (this.isStreaming()) return;

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

  stopStreaming(): void {
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
  }

  ngOnDestroy(): void {
    this.stopStreaming();
  }
}
