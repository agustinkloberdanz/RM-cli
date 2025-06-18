import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSelect } from '@ionic/angular';
import { LocationDTO } from 'src/app/Models/LocationDTO';
import { NotificationDTO } from 'src/app/Models/NotificationDTO';
import { RouteDTO } from 'src/app/Models/RouteDTO';
import { NotificationsService } from 'src/app/Services/Notifications/notifications.service';
import { RoutesService } from 'src/app/Services/Routes/routes.service';
import { UsersService } from 'src/app/Services/Users/users.service';
import { ToolsService } from 'src/app/Tools/ToolsService';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.page.html',
  styleUrls: ['./driver.page.scss'],
  standalone: false
})
export class DriverPage {
  @ViewChild('select') select: IonSelect;

  driverName: string = ''

  today = new Date()
  logged: boolean = false

  progress: number = 0
  buttonText: string = 'I am arriving!'
  buttonColor: string = 'primary'

  routes: RouteDTO[] = []
  route: RouteDTO

  notifyLocations: LocationDTO[] = []

  isViewRouteModalOpen: boolean = false
  isSelectHidden: boolean = true

  constructor(public tools: ToolsService, private routesService: RoutesService, private usersService: UsersService, private router: Router, private notificationsService: NotificationsService) { }

  async ionViewWillEnter() { await this.getData() }

  // Get user data
  async getData() {
    await this.tools.presentLoading();
    this.usersService.GetOwn().subscribe(
      async (res: any) => {
        if (!res.isSuccess) this.router.navigateByUrl('login')
        else {
          await this.getTodayRoutes()
          this.driverName = res.model.firstName + ' ' + res.model.lastName
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

  // Get all today's routes
  async getTodayRoutes() {
    await this.tools.presentLoading();

    this.routesService.GetRoutesByDrivingDate(this.tools.getDate(new Date())).subscribe(
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

  // Open select route element
  openSelect() {
    this.select.open()
  }

  // Handle big button click
  async handleClick() {
    if (this.notifyLocations[1]) {

      if (this.buttonText === 'I am arriving!') {
        const arriving: NotificationDTO = {
          userEmail: this.notifyLocations[1].userEmail,
          message: `🚌${this.notifyLocations[1].userEmail}: The bus is arriving!\nAddress: ${this.notifyLocations[1].address}.\nDriver's name: ${this.driverName}.`
        }

        const buttons = [
          {
            text: 'Send',
            handler: async () => {
              this.buttonText = 'I am at door!'
              this.buttonColor = 'success'
              // Notifies the CURRENT user that the bus is approaching
              this.notificationsService.SendNotification(arriving).subscribe(
                response => {
                  console.log(arriving.userEmail + ': Notification approaching ' + response.message)
                },
                async (err) => {
                  if (err.status === 401) {
                    this.router.navigateByUrl('login')
                    await this.tools.presentToast('Expired session')
                  } else {
                    await this.tools.presentToast('Error while connecting to the server')
                  }
                })
              await this.tools.presentToast('User notified')
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]

        await this.tools.presentAlert('Routing Maps', `${this.notifyLocations[1].address}: I am arriving!`, buttons)
      } else if (this.buttonText === 'I am at door!') {
        const atDoor: NotificationDTO = {
          userEmail: this.notifyLocations[1].userEmail,
          message: `🚌${this.notifyLocations[1].userEmail}: The bus is at door!\nAddress: ${this.notifyLocations[1].address}.\nDriver's name: ${this.driverName}.`
        }

        const buttons = [
          {
            text: 'Send',
            handler: async () => {
              this.buttonText = 'I am arriving!'
              this.buttonColor = 'primary'

              // Notifies the CURRENT user that the bus is at door
              this.notificationsService.SendNotification(atDoor).subscribe(
                response => {
                  console.log(atDoor.userEmail + ': Notification at door ' + response.message)
                },
                async (err) => {
                  if (err.status === 401) {
                    this.router.navigateByUrl('login')
                    await this.tools.presentToast('Expired session')
                  } else {
                    await this.tools.presentToast('Error while connecting to the server')
                  }
                }
              )

              // If it exists, notifies the NEXT user that the bus is comming
              if (this.notifyLocations[2]) {
                const onTheWay: NotificationDTO = {
                  userEmail: this.notifyLocations[2].userEmail,
                  message: `🚌${this.notifyLocations[2].userEmail}: The bus is comming!\nAddress: ${this.notifyLocations[2].address}.\nDriver's name: ${this.driverName}.`
                }

                this.notificationsService.SendNotification(onTheWay).subscribe(
                  response => {
                    console.log(onTheWay.userEmail + ': Notification on the way ' + response.message)
                  },
                  async (err) => {
                    if (err.status === 401) {
                      this.router.navigateByUrl('login')
                      await this.tools.presentToast('Expired session')
                    } else {
                      await this.tools.presentToast('Error while connecting to the server')
                    }
                  }
                )
              }

              // Set the CURRENT location as notified
              this.routesService.SetNotifiedLocation(this.notifyLocations[1].id).subscribe(
                response => {
                  if (response.isSuccess) {
                    this.route.locations.forEach(location => { if (location.id == this.notifyLocations[1].id) location.isNotified = true })
                    this.routes.forEach(route => { if (route.id == this.route.id) route.locations.forEach(location => { if (location.id == this.notifyLocations[1].id) location.isNotified = true }) })
                  }
                  this.nextLocation()
                },
                async (err) => {
                  if (err.status === 401) {
                    this.router.navigateByUrl('login')
                    await this.tools.presentToast('Expired session')
                  } else {
                    await this.tools.presentToast('Error while connecting to the server')
                  }
                }
              )

              await this.tools.presentToast('User notified')
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]

        await this.tools.presentAlert('Routing Maps', `${this.notifyLocations[1].address}: I am at door!`, buttons)
      }
    }
  }

  // Handle next location
  nextLocation() {
    this.notifyLocations.splice(0, 1)
    this.calculateProgress(this.route.id)

    console.log(this.route.locations)
  }

  // Check if driving has started 
  checkIsDrivingStarted(): boolean {
    var flag: boolean = false
    this.route.locations.forEach(location => { if (location.isNotified) flag = true })
    return flag
  }

  // Check if driving has finished
  checkIsDrivingFinished(): boolean {
    var flag: boolean = true
    this.route.locations.forEach(location => { if (!location.isNotified) flag = false })
    return flag
  }

  // Handle route change from select
  handleRouteChange(e: any) {
    const id = e.detail.value
    if (id !== '') {
      this.isSelectHidden = false
      this.route = this.routes.find(route => route.id == id)!
      this.startRoute()
    } else {
      this.isSelectHidden = true
      this.route = new RouteDTO()
      this.notifyLocations = []
      this.progress = 0
    }
    this.buttonText = 'I am arriving!'
    this.buttonColor = 'primary'
  }

  // Start route
  startRoute() {
    if (!this.checkIsDrivingFinished()) {
      if (!this.checkIsDrivingStarted()) {
        // Add the origin of the route
        // For example, the garage where buses are parked
        const origin: LocationDTO = {
          id: 0,
          address: 'San Luis, 3853',
          order: 0,
          routeId: this.route.id,
          userEmail: '',
          isNotified: false
        }
        if (JSON.stringify(origin) !== JSON.stringify(this.route.locations[0])) {
          this.route.locations.push(origin)
        }

        this.route.locations.sort(function (a, b) {
          return a.order - b.order
        })

        this.notifyLocations = [...this.route.locations]
      } else {
        this.route.locations.sort(function (a, b) {
          return a.order - b.order
        })

        var lastLocation: LocationDTO = new LocationDTO()
        var flag = false
        var i = 0
        while (!flag) {
          if (!this.route.locations[i].isNotified) {
            lastLocation = this.route.locations[i - 1]
            flag = true
          }
          i++
        }

        if (JSON.stringify(lastLocation) != JSON.stringify(new LocationDTO())) this.notifyLocations = this.route.locations.filter(location => !location.isNotified || JSON.stringify(location) === JSON.stringify(lastLocation))
        else this.tools.presentToast('The selected route is already finished')
      }

      this.calculateProgress(this.route.id)
    } else {
      this.tools.presentToast('The selected route is already finished')
    }
  }

  // Calculate progress of the route
  calculateProgress(routeId: number) {
    var route = this.routes.find(route => route.id == routeId)!
    this.progress = (route.locations.indexOf(this.notifyLocations[0]) + 1) / this.route.locations.length
  }

  // Open view route modal
  openViewRouteModal() {
    this.isViewRouteModalOpen = true
  }

  // Close view route modal
  closeViewRouteModal() {
    this.isViewRouteModalOpen = false
  }
}