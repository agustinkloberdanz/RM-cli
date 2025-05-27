import { Injectable } from '@angular/core';
import { MainService } from '../Main/main.service';
import { RegisterDTO } from 'src/app/Models/RegisterDTO';
import { LoginDTO } from 'src/app/Models/LoginDTO';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends MainService {

  Register(registerDTO: RegisterDTO): Observable<any> {
    return this.http.post(this.API_URL + 'Users/Register', registerDTO);
  }

  Login(loginDTO: LoginDTO): Observable<any> {
    return this.http.post(this.API_URL + 'Auth/Login', loginDTO);
  }

  GetOwn(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(this.API_URL + 'Users/getOwn', { headers: headers });
  }

  GetData(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(this.API_URL + 'Users/getData', { headers: headers });
  }

  GetAllUsers(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(this.API_URL + 'Users/getAll', { headers: headers });
  }
}
