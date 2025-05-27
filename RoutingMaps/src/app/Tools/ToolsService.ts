import { Injectable } from "@angular/core";
import { ToastController, LoadingController, AlertController } from "@ionic/angular";

@Injectable({
    providedIn: 'root'
})

export class ToolsService {
    private loading: HTMLIonLoadingElement | null = null;

    constructor(
        private alertController: AlertController,
        private toastController: ToastController,
        private loadingController: LoadingController
    ) { }

    getDate(date: Date): string {
        date = new Date(date)
        var stringMonth = `${date.getMonth() + 1}`
        var stringDate = `${date.getDate()}`

        if (parseInt(stringMonth) < 10) stringMonth = `0${stringMonth}`
        if (parseInt(stringDate) < 10) stringDate = `0${stringDate}`
        return `${date.getFullYear()}-${stringMonth}-${stringDate}`
    }

    getTime(date: Date): string {
        date = new Date(date)
        var stringHour = `${date.getHours()}`
        var stringMinutes = `${date.getMinutes()}`

        if (parseInt(stringHour) < 10) stringHour = `0${stringHour}`
        if (parseInt(stringMinutes) < 10) stringMinutes = `0${stringMinutes}`
        return `${stringHour}:${stringMinutes}`
    }

    async presentAlert(header: string, message: string, buttons: any[] = ['OK']): Promise<void> {
        const alert = await this.alertController.create({
            header,
            message,
            buttons
        });
        await alert.present();
    }

    async presentToast(message: string, duration: number = 2000, color: string = 'medium'): Promise<void> {
        const toast = await this.toastController.create({
            message,
            duration,
            color,
            position: 'bottom'
        });
        await toast.present();
    }

    async presentLoading(message: string = 'Loading...'): Promise<void> {
        if (!this.loading) {
            this.loading = await this.loadingController.create({
                message,
                spinner: 'crescent'
            });
            await this.loading.present();
        }
    }

    async dismissLoading(): Promise<void> {
        if (this.loading) {
            await this.loading.dismiss();
            this.loading = null;
        }
    }
}
