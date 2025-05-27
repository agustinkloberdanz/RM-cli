import { Component, ElementRef, input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { LocationDTO } from 'src/app/Models/LocationDTO';

declare var google: any; // Add this line to declare the 'google' variable

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
  standalone: false
})
export class MapsComponent implements OnChanges {
  fromAddress = input.required<LocationDTO>()
  toAddress = input.required<LocationDTO>()
  @ViewChild('map', { static: true }) mapElement!: ElementRef
  map: any
  directionService = new google.maps.DirectionsService()
  directionsDisplay = new google.maps.DirectionsRenderer()
  geocoder = new google.maps.Geocoder()

  //Detect changes in the input properties
  ngOnChanges(changes: SimpleChanges) {
    this.loadMap()
  }

  //Load the map when the component is initialized
  loadMap() {
    const latLng = new google.maps.LatLng(-38.00689925430091, -57.56997953603233)

    const mapOptions = {
      center: latLng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions)

    this.directionsDisplay.setMap(this.map)

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.calculateRoute()
    })
  }

  //Calculate the route between the two addresses
  calculateRoute() {
    let origin: any
    let destination: any

    if (this.toAddress() && this.fromAddress()) {

      this.geocoder.geocode({ 'address': `${this.fromAddress().address}, Mar del Plata, Buenos Aires, Argentina` }, (results: { geometry: { location: any } }[], status: string) => {
        if (status === 'OK') {
          origin = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() }
          this.geocoder.geocode({ 'address': `${this.toAddress().address}, Mar del Plata, Buenos Aires, Argentina` }, (results: { geometry: { location: any } }[], status: string) => {
            if (status === 'OK') {
              destination = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() }

              this.directionService.route({
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING
              }, (response: any, status: any) => {
                if (status === google.maps.DirectionsStatus.OK) {
                  this.directionsDisplay.setDirections(response)
                } else {
                  alert('Error al cargar recorrido')
                }
              })
            } else {
              alert('Geocode no fue exitoso por la siguiente razón: ' + status)
            }
          })
        } else {
          alert('Geocode no fue exitoso por la siguiente razón: ' + status)
        }
      })
    }
  }
}