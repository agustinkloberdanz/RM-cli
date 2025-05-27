import { LocationDTO } from "./LocationDTO"

export class RouteDTO {
    id: number
    drivingDate: Date
    locations: LocationDTO[] = []
}