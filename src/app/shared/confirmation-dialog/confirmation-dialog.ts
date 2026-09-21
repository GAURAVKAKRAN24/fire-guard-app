import { Component, HostListener, inject } from '@angular/core';
import { ConfirmationService } from '../../core/services/confirmation';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss'
})
export class ConfirmationDialog {
  readonly confirmationService = inject(ConfirmationService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.confirmationService.confirmation()) {
      this.confirmationService.close(false);
    }
  }
}
