import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'notificationLink'
})
export class NotificationLinkPipe implements PipeTransform {

  transform(notificationType: string): string {
    switch(notificationType) {
      case 'NEW_CHAT':
        return '/user-dashboard/chats';
      case 'LESSON_REQUEST':
        return '/user-dashboard/my-tuitions';
      case 'LESSON_CANCEL':
        return '/user-dashboard/my-tuitions';
      case 'PAYMENT_OVERDUE':
      case 'PAYMENT_MADE':
        return '/user-dashboard/payments';
      case 'REQUEST_ACCEPTED':
      case 'REQUEST_REJECTED':
        return '/user-dashboard/my-tuitions';
      default:
        return '/user-dashboard';
    }
  }
}
