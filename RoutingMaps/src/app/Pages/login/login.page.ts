import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginDTO } from 'src/app/Models/LoginDTO';
import { UsersService } from 'src/app/Services/Users/users.service';
import { ToolsService } from 'src/app/Tools/ToolsService';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {

  user: LoginDTO = new LoginDTO();

  constructor(private tools: ToolsService,private usersService: UsersService, private router: Router) { }

  async ionViewWillEnter() {
    await this.getData()
  }

  async getData() {
    await this.tools.presentLoading();

    this.usersService.GetOwn().subscribe(
      async (res: any) => {
        if (res.statusCode == 200) this.router.navigateByUrl('manage-routes')
        else localStorage.removeItem('Token')
        await this.tools.dismissLoading()
      },
      async (err) => {
        localStorage.removeItem('Token')
        await this.tools.dismissLoading()
      }
    )
  }

  async login() {
    await this.tools.presentLoading();

    this.usersService.Login(this.user).subscribe(
      async (res: any) => {
        if (!res.isSuccess) await this.tools.presentToast(res.message, 2000);

        else {
          localStorage.setItem('Token', res.model)
          this.router.navigateByUrl('manage-routes')
        }

        await this.tools.dismissLoading()
      },
      async (err: any) => {
        console.log(err)
        await this.tools.presentAlert('Error', 'Error while connecting to the server');
        await this.tools.dismissLoading()
      }
    )
  }

}