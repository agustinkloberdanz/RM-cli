import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MainService {

  constructor(public http: HttpClient) { }

  // public API_URL = 'https://localhost:7039/api/';
  public API_URL = 'https://p4bnc6db-7039.brs.devtunnels.ms/api/';

  createHeaders() {
    const token = localStorage.getItem('Token');

    const headers = new HttpHeaders({
      "Authorization": `Bearer ${token}`
    })

    return headers;
  }

}
