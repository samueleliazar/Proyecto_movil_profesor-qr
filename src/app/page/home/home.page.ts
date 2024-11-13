import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  correo: string = '';
  contrasena: string = '';

  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private alertController: AlertController
  ) {}

  async login() {
    try {
      const userCredential = await this.userService.loginWithEmail(this.correo, this.contrasena);
      
      if (userCredential.user) {
        if (this.correo.endsWith('@profesor.duoc.cl')) {
          this.navCtrl.navigateForward('docente');
        } else if (this.correo.endsWith('@duocuc.cl')) {
          this.navCtrl.navigateForward('/alumno'); 
        }
      }
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Credenciales incorrectas. ',
        buttons: ['Aceptar'],
      });
      await alert.present();
    }
  }

  goTodocente() {
    this.navCtrl.navigateForward('/docente');
  }

  goToalumno() {
    this.navCtrl.navigateForward('/alumno');
  }

  goToperfil() {
    this.navCtrl.navigateForward('/perfil');
  }

  goTorecover_password() {
    this.navCtrl.navigateForward('/code-verifi');
  }
}
