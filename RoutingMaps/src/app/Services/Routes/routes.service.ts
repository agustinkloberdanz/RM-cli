import { Injectable } from '@angular/core';
import { MainService } from '../Main/main.service';
import { Observable } from 'rxjs';
import { LocationDTO } from 'src/app/Models/LocationDTO';
import { RouteDTO } from 'src/app/Models/RouteDTO';
import { AddRouteDTO } from 'src/app/Models/AddRouteDTO';

@Injectable({
  providedIn: 'root'
})
export class RoutesService extends MainService {

  AddLocation(addLocation: LocationDTO): Observable<any> {
    const headers = this.createHeaders()
    return this.http.post(`${this.API_URL}Routes/location/addLocation`, addLocation, { headers: headers })
  }

  DeleteLocation(id: number): Observable<any> {
    const headers = this.createHeaders()
    return this.http.get(`${this.API_URL}Routes/location/deleteLocation/${id}`, { headers: headers })
  }

  GetAllRoutes(): Observable<any> {
    const headers = this.createHeaders()
    return this.http.get(`${this.API_URL}Routes/getAllRoutes`, { headers: headers })
  }

  GetRouteById(id: number): Observable<any> {
    const headers = this.createHeaders()
    return this.http.get(`${this.API_URL}Routes/getRoute/${id}`, { headers: headers })
  }

  AddRoute(route: AddRouteDTO): Observable<any> {
    const headers = this.createHeaders()
    return this.http.post(`${this.API_URL}Routes/addRoute`, route, { headers: headers })
  }

  UpdateRoute(route: RouteDTO): Observable<any> {
    const headers = this.createHeaders()
    return this.http.post(`${this.API_URL}Routes/updateRoute`, route, { headers: headers })
  }

  DeleteRoute(id: number): Observable<any> {
    const headers = this.createHeaders()
    return this.http.get(`${this.API_URL}Routes/deleteRoute/${id}`, { headers: headers })
  }

  GetRoutesByDrivingDate(drivingDate: string): Observable<any> {
    const headers = this.createHeaders()
    return this.http.get(`${this.API_URL}Routes/GetRoutesByDrivingDate/${drivingDate}`, { headers: headers })
  }

  SetNotifiedLocation(id: number): Observable<any> {
    const headers = this.createHeaders()
    return this.http.get(`${this.API_URL}Routes/location/notifyLocation/${id}`, { headers: headers })
  }
}
