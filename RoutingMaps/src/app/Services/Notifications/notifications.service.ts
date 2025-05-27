import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationDTO } from 'src/app/Models/NotificationDTO';
import { MainService } from '../Main/main.service';
import { DeviceDTO } from 'src/app/Models/DeviceDTO';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService extends MainService {

  SendNotification(notification: NotificationDTO): Observable<any> {
    const headers = this.createHeaders()
    return this.http.post(`${this.API_URL}Users/notifications`, notification, { headers: headers })
  }

  AddDevice(deviceDTO: DeviceDTO): Observable<any> {
    const headers = this.createHeaders()
    return this.http.post(`${this.API_URL}Users/device/addDevice`, deviceDTO, { headers: headers })
  }
}
