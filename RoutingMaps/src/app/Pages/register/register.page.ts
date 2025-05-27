import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterDTO } from 'src/app/Models/RegisterDTO';
import { UsersService } from 'src/app/Services/Users/users.service';
import { ToolsService } from 'src/app/Tools/ToolsService';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {

  user: RegisterDTO = new RegisterDTO();
  passwordCheck: string = '';

  constructor(private tools: ToolsService, private usersService: UsersService, private router: Router) { }

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

  async register() {
    if (this.user.password !== this.passwordCheck) return await this.tools.presentAlert('Error', 'Passwords do not match');

    await this.tools.presentLoading();

    this.usersService.Register(this.user).subscribe(
      async (res: any) => {
        if (!res.isSuccess) await this.tools.presentAlert('Error', res.message);
        else {
          await this.tools.presentToast('User created successfully', 2000, 'success');

          this.usersService.Login(this.user).subscribe(
            async (res: any) => {
              if (!res.isSuccess) await this.tools.presentAlert('Error', res.message);

              else {
                localStorage.setItem('Token', res.model)
                this.router.navigateByUrl('manage-routes')
              }

              await this.tools.dismissLoading()
            },
            async (err: any) => {
              await this.tools.presentAlert('Error', 'Error while connecting to the server');
              await this.tools.dismissLoading()
            }
          )
        }

        await this.tools.dismissLoading()
      },
      async (err: any) => {
        await this.tools.presentAlert('Error', 'Error while connecting to the server');
        await this.tools.dismissLoading()
      }
    )
  }
}
