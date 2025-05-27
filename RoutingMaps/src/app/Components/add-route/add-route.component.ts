import { Component, output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddRouteDTO } from 'src/app/Models/AddRouteDTO';
import { RoutesService } from 'src/app/Services/Routes/routes.service';
import { ToolsService } from 'src/app/Tools/ToolsService';

@Component({
  selector: 'app-add-route',
  templateUrl: './add-route.component.html',
  styleUrls: ['./add-route.component.scss'],
  standalone: false
})
export class AddRouteComponent {
  successAddRoute = output()
  addRouteDTO: AddRouteDTO = new AddRouteDTO()
  addRouteDateString = new Date().toISOString()

  constructor(private modalController: ModalController, private routesService: RoutesService, private tools: ToolsService) { }

  //Add route function
  async addRoute() {
    await this.tools.presentLoading('Adding Route...')

    this.routesService.AddRoute(this.addRouteDTO).subscribe(
      async (res: any) => {
        if (res.statusCode != 200) await this.tools.presentToast(res.message)
        else {
          this.successAddRoute.emit()
          await this.tools.presentToast('Route added successfully')
          await this.closeModal()
        }

        await this.tools.dismissLoading()
      },
      async (er: any) => {
        await this.tools.dismissLoading()
        await this.tools.presentToast('Error while connecting to the server')
      }
    )
  }

  handleDatetimeChange(event: any) {
    var date = event.target.value
    this.addRouteDTO.drivingDate = date
  }

  async closeModal() { await this.modalController.dismiss() }
}
