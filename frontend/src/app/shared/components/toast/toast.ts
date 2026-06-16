import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  NotificationService,
  AppNotification
} from '../../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class Toast {

  visible = false;

  title = '';

  message = '';

  timeoutId: any;

  constructor(
    private notificationService: NotificationService
  ) {

    this.notificationService.notifications$
      .subscribe((notification: AppNotification) => {

        this.title = notification.title;
        this.message = notification.message;

        this.visible = true;

        clearTimeout(this.timeoutId);

        this.timeoutId = setTimeout(() => {

          this.close();

        }, 5000);

      });

  }

  close(): void {

    this.visible = false;

  }

}