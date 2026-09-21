import { Injectable, signal } from '@angular/core';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
}

interface ConfirmationState extends ConfirmationOptions {
  resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  readonly confirmation = signal<ConfirmationState | null>(null);

  open(options: ConfirmationOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.confirmation.set({ ...options, resolve });
    });
  }

  close(confirmed: boolean): void {
    const activeConfirmation = this.confirmation();
    if (activeConfirmation) {
      activeConfirmation.resolve(confirmed);
      this.confirmation.set(null);
    }
  }
}
