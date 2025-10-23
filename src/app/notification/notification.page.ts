import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../services/notification.service';
import { TaskService } from '../services/task.service';
import { ToastService } from '../services/toast.service';

@Component({
    selector: 'app-notifications',
    templateUrl: './notification.page.html',
    styleUrl: './notification.page.scss',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ]
})

export class NotificationPage {

    notifications: Notification[] = []

    private router = inject(Router)
    private notificationService = inject(NotificationService)
    private toastService = inject(ToastService)
    private taskService = inject(TaskService)

    constructor () {}

    ngOnInit ()
    {
        this.loadNotifications()
    }

    loadNotifications ()
    {
        this.notificationService.getNotifications().subscribe({
            next: (notifications) => {
                this.notifications = notifications
            },
            error: (error) => {
                console.error('notificacion de error de notificacion', error)
                this.toastService.showError('notificacion de error de notificacion','ERROR')
            }
        })
    }

    acceptNotification (notification: Notification)
    {
        this.taskService.deleteTaskPermanent(notification.task._id).subscribe()
    }

    dismissNotification (notification: Notification)
    {
        this.notificationService.deleteNotification(notification._id!).subscribe()
    }

    goToHome()
    {
        this.router.navigateByUrl('/home')
    }

}