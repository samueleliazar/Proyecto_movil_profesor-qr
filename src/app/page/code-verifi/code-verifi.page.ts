import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { UserService } from 'src/app/user.service';
@Component({
  selector: 'app-code-verifi',
  templateUrl: './code-verifi.page.html',
  styleUrls: ['./code-verifi.page.scss'],
})
export class CodeVerifiPage implements OnInit {
  correo: string = '';
  constructor(private navCtrl: NavController, private userService: UserService,
  private alertController: AlertController) { }

  ngOnInit() {
  }
  async sendResetPasswordEmail() {
    try {
      await this.userService.sendPasswordResetEmail(this.correo);
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.',
        buttons: ['Aceptar'],
      });
      await alert.present();
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un error al enviar el correo. Por favor, verifica tu dirección de correo.',
        buttons: ['Aceptar'],
      });
      await alert.present();
    }
  }
}
