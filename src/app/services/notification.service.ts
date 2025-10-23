import { Injectable } from '@angular/core'; 
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { environment } from '../../environments/environment';

export interface Notification {
    _id?:string,
    message?:string,
    user:{username:string,_id:string},
    task:{title:string,_id:string}
}

@Injectable({
    providedIn:'root'
})

export class NotificationService {
    private apiUrl = environment.apiUrl+'/notifications'

    constructor (private http:HttpClient){}

    getNotifications(): Observable<Notification[]>
    {
        return this.http.get<Notification[]>(this.apiUrl)
    }

    createNotification(data: {message?:string,user:string,task:string}): Observable<Notification>
    {
        return this.http.post<Notification>(this.apiUrl, data)
    }

    deleteNotification(id:string): Observable<any>
    {
        return this.http.delete(`${this.apiUrl}/${id}`)
    }
}