import { DeviceDTO } from "./DeviceDTO"

export class UserDTO {
    email: string
    firstName: string
    lastName: string
    devices: DeviceDTO[] = []
}