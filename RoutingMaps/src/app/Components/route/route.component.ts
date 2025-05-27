import { Component, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemReorderEventDetail, ModalController } from '@ionic/angular';
import { LocationDTO } from 'src/app/Models/LocationDTO';
import { RouteDTO } from 'src/app/Models/RouteDTO';
import { UserDTO } from 'src/app/Models/UserDTO';
import { RoutesService } from 'src/app/Services/Routes/routes.service';
import { UsersService } from 'src/app/Services/Users/users.service';
import { ToolsService } from 'src/app/Tools/ToolsService';

@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.scss'],
  standalone: false
})
export class RouteComponent implements OnInit {

  routeId = input<number>()
  route: RouteDTO = new RouteDTO()

  isRouteStarted: boolean = false
  isReorderDisabled: boolean = true
  isAddLocationInput: boolean = false
  isSelectEmailModalOpen: boolean = false

  addLocationStreet = ''
  addLocationNumber = ''

  addLocationEmailValue = ''
  query = ''

  users: UserDTO[] = []
  filtredUsers: UserDTO[] = []

  constructor(private router: Router, private usersService: UsersService, private modalController: ModalController, private routesService: RoutesService, public tools: ToolsService) { }

  async ngOnInit() {
    await this.getRoute()
  }

  // Get route and order its locations
  // If the route has no locations, disable reorder
  async getRoute() {
    await this.tools.presentLoading('Getting route...')
    this.routesService.GetRouteById(this.routeId()!).subscribe(
      async (res) => {
        if (!res.isSuccess) await this.tools.presentToast(res.message)
        else {
          this.route = res.model
          this.route.locations.sort(function (a, b) {
            return a.order - b.order
          })
          if (this.route.locations.length === 0) this.isReorderDisabled = true
          if (this.route.locations[0]?.isNotified) this.isRouteStarted = true
        }
        await this.tools.dismissLoading()
      },
      async (err) => {
        if (err.status === 401) {
          this.router.navigateByUrl('login')
          await this.modalController.dismiss()
          await this.tools.presentToast('Expired session')
        } else {
          await this.tools.presentToast('Error while connecting to the server')
        }
        await this.tools.dismissLoading()
      }
    )
  }

  // Update route 
  async confirmModifyRoute() {
    await this.tools.presentLoading('Updating route...')
    this.routesService.UpdateRoute(this.route).subscribe(
      async (res) => {
        if (!res.isSuccess) await this.tools.presentToast(res.message)
        else await this.tools.presentToast('Route updated successfully')
        await this.tools.dismissLoading()
      },
      async (err) => {
        if (err.status === 401) {
          this.router.navigateByUrl('login')
          await this.modalController.dismiss()
          await this.tools.presentToast('Expired session')
        } else {
          await this.tools.presentToast('Error while connecting to the server')
        }
        await this.tools.dismissLoading()
      }
    )
  }

  // Disable and enable reorder
  // If reorder is disabled, the user cannot reorder locations or add/delete locations
  // If reorder is enabled, the user can reorder locations and add/delete locations
  reorder() {
    this.isReorderDisabled = !this.isReorderDisabled
  }

  //Close select email modal when adding a location
  closeSelectEmailModal() {
    this.isSelectEmailModalOpen = false
    this.cancelAddLocation()
    this.addLocationEmailValue = ''
    this.query = ''
  }

  // Handle search input for filtering users
  handleSearchInput() {
    this.filtredUsers = [... this.users]
    this.filtredUsers = this.filtredUsers.filter(e => e.email.match(this.query))
  }

  // Set the email to the location to be added
  async setEmailToAddLocation(email: string) {
    this.addLocationEmailValue = email
    await this.confirmAddLocation()
  }

  // Confirm adding a location
  async confirmAddLocation() {
    let location: LocationDTO = new LocationDTO()
    location.routeId = this.route.id
    location.address = `${this.addLocationStreet.trim()}, ${this.addLocationNumber.toString().trim()}`
    location.order = this.route.locations.length + 1
    location.userEmail = this.addLocationEmailValue

    this.routesService.AddLocation(location).subscribe(
      async (res) => {
        if (!res.isSuccess) await this.tools.presentToast(res.message)
        else {
          await this.tools.presentToast('Location added successfully')
          await this.getRoute()
          this.closeSelectEmailModal()
        }
        await this.tools.dismissLoading()
      },
      async (err) => {
        if (err.status === 401) {
          this.router.navigateByUrl('login')
          await this.modalController.dismiss()
          await this.tools.presentToast('Expired session')
        } else {
          await this.tools.presentToast('Error while connecting to the server')
        }
        await this.tools.dismissLoading()
      }
    )
  }

  // Handle reorder event
  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    this.route.locations = ev.detail.complete(this.route.locations)
    this.route.locations.map(e => e.order = this.route.locations.indexOf(e) + 1)
  }

  addLocation() {
    this.isAddLocationInput = true
    this.addLocationStreet = ''
    this.addLocationNumber = ''
  }

  cancelAddLocation() {
    this.isAddLocationInput = false
    this.addLocationStreet = ''
    this.addLocationNumber = ''
  }


  // Delete location function
  async deleteLocation(id: number) {

    const buttons = [
      {
        text: 'Yes',
        handler: async () => {
          await this.tools.presentLoading('Deleting address...')
          this.routesService.DeleteLocation(id).subscribe(
            async (res) => {
              if (!res.isSuccess) await this.tools.presentToast(res.message)
              else {
                await this.tools.presentToast('Address deleted successfully')
                await this.getRoute()
              }
              await this.tools.dismissLoading()
            },
            async (err) => {
              if (err.status === 401) {
                this.router.navigateByUrl('login')
                await this.modalController.dismiss()
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

    await this.tools.presentAlert('Routing Maps', 'Are you sure you want to delete this address?', buttons)
  }

  // Set address to the location to be added
  async setAddressToAddLocation() {
    if (this.addLocationStreet != '' && this.addLocationNumber.toString() != '') {
      this.usersService.GetAllUsers().subscribe(
        async (res) => {
          if (!res.isSuccess) await this.tools.presentToast(res.message)
          else {
            this.users = res.collection
            this.filtredUsers = [... this.users]
            this.isSelectEmailModalOpen = true
          }
        },
        async (err) => {
          if (err.status === 401) {
            this.router.navigateByUrl('login')
            await this.modalController.dismiss()
            await this.tools.presentToast('Expired session')
          } else {
            await this.tools.presentToast('Error while connecting to the server')
          }
          await this.tools.dismissLoading()
        })
    } else {
      await this.tools.presentToast('Please fill all the fields')
    }
  }

  //Close route modal function
  async closeModal() { await this.modalController.dismiss() }
}
