import { Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss'
})
export class NotificationCenter {
  readonly notificationService = inject(NotificationService);
}
