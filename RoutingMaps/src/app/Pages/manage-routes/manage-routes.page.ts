import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouteDTO } from 'src/app/Models/RouteDTO';
import { RoutesService } from 'src/app/Services/Routes/routes.service';
import { UsersService } from 'src/app/Services/Users/users.service';
import { ToolsService } from 'src/app/Tools/ToolsService';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { DeviceDTO } from 'src/app/Models/DeviceDTO';
import { NotificationsService } from 'src/app/Services/Notifications/notifications.service';

@Component({
  selector: 'app-manage-routes',
  templateUrl: './manage-routes.page.html',
  styleUrls: ['./manage-routes.page.scss'],
  standalone: false
})
export class ManageRoutesPage {
  realToken: string = "No token yet";

  routes: RouteDTO[] = []
  isAddRouteModalOpen = false

  selectedRouteId: number
  isRouteModalOpen = false

  constructor(private notificationsService: NotificationsService, private platform: Platform, public tools: ToolsService, private routesService: RoutesService, private usersService: UsersService, private router: Router) { }

  async ionViewWillEnter() { await this.getData() }

  // Get user data
  async getData() {
    await this.tools.presentLoading();
    this.usersService.GetOwn().subscribe(
      async (res: any) => {
        if (!res.isSuccess) this.router.navigateByUrl('login')
        else {
          await this.getAllRoutes()

          if (this.platform.is('android') || this.platform.is('ios')) {
            this.registerPushNotifications();
          } else {
            console.log('Push Notifications are not supported on web.');
          }
        }
        await this.tools.dismissLoading()
      },
      async (err) => {
        if (err.status === 401) await this.tools.presentToast('Expired session')
        else await this.tools.presentToast('Error while connecting to the server')
        await this.tools.dismissLoading()
        localStorage.removeItem('Token')
        this.router.navigateByUrl('login')
      }
    )
  }

  // Get all routes
  async getAllRoutes() {
    await this.tools.presentLoading();

    this.routesService.GetAllRoutes().subscribe(
      async (res: any) => {
        if (!res.isSuccess) await this.tools.presentAlert('Routing Maps', res.message)
        else this.routes = res.collection

        await this.tools.dismissLoading()
      },
      async (err) => {
        if (err.status === 401) {
          this.router.navigateByUrl('login')
          await this.tools.presentToast('Expired session')
        } else {
          await this.tools.presentToast('Error while connecting to the server')
        }
        await this.tools.dismissLoading()
      }
    )
  }

  // Open modal to view the selected route
  async viewRoute(route: RouteDTO) {
    this.selectedRouteId = route.id
    this.isRouteModalOpen = true
  }

  // Delete route
  async deleteRoute(route: RouteDTO) {
    const buttons = [
      {
        text: 'Yes',
        handler: async () => {
          await this.tools.presentLoading('Deleting route...')
          this.routesService.DeleteRoute(route.id).subscribe(
            async (res) => {
              if (!res.isSuccess) await this.tools.presentToast(res.message)
              else {
                await this.getAllRoutes()
                await this.tools.presentToast('Route deleted successfully')
              }
              await this.tools.dismissLoading()
            },
            async (err) => {
              if (err.status === 401) {
                this.router.navigateByUrl('login')
                await this.tools.presentToast('Expired session')
              } else {
                await this.tools.presentToast('Error while connecting to the server')
              }
              await this.tools.dismissLoading()
            }
          )
        }
      },
      {
        text: 'No',
        role: 'cancel'
      }
    ]

    await this.tools.presentAlert('Routing Maps', 'Are you sure you want to delete the route?', buttons)
  }

  // Logout function
  async logout() {
    const buttons = [
      {
        text: 'Yes',
        handler: async () => {
          localStorage.removeItem('Token')
          this.router.navigateByUrl('login')
        }
      },
      {
        text: 'No',
        role: 'cancel'
      }
    ]

    await this.tools.presentAlert('Routing Maps', 'Are you sure you want to logout?', buttons)
  }

  //Register cpacitor push notifications
  registerPushNotifications() {
    //Aks for permission to use push notifications
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    //On success, get the device token and save it in the DataBase
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      this.realToken = token.value;
      localStorage.setItem('pushToken', token.value);

      var device: DeviceDTO = {
        deviceId: "",
        deviceKey: "",
        token: this.realToken
      }

      this.notificationsService.AddDevice(device).subscribe((response: any) => {
        console.log(response);
      })
    });

    //On error, show an alert with the error message
    PushNotifications.addListener('registrationError', (error: any) => {
      this.tools.presentAlert('Error on registration: ', JSON.stringify(error));
    });

    //On push notification received, show an alert with the notification body
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this.tools.presentAlert('Routing Maps: ', notification.body!.toString());
      },
    );

    //On push notification action performed, log the notification to the console
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Routing Maps: ', JSON.stringify(notification));
      },
    );
  }
}

