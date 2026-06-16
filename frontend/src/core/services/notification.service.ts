import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppNotification {

  title: string;

  message: string;

  type: 'success' | 'warning' | 'error';

}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notifications$ =
    new Subject<AppNotification>();

  show(
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' = 'success'
  ): void {

    this.notifications$.next({

      title,
      message,
      type

    });

  }

}