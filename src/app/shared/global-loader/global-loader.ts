import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  templateUrl: './global-loader.html',
  styleUrl: './global-loader.scss'
})
export class GlobalLoader {
  readonly loadingService = inject(LoadingService);
}
