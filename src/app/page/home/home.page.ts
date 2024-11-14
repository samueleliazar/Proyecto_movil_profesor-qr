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

  ngOnInit() {
    // Verificar si el usuario está autenticado al cargar la página
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      // Si el usuario ya está autenticado, redirigirlo a su página correspondiente
      if (userEmail.endsWith('@profesor.duoc.cl')) {
        this.navCtrl.navigateForward('docente');
      } else if (userEmail.endsWith('@duocuc.cl')) {
        this.navCtrl.navigateForward('/alumno');
      }
    }
  }

  async login() {
    try {
      const userCredential = await this.userService.loginWithEmail(this.correo, this.contrasena);
      
      if (userCredential.user) {
        const user = userCredential.user;
        // Guardar datos en localStorage después de login exitoso
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userUID', user.uid);
        
        // Redirigir según el tipo de usuario
        if (this.correo.endsWith('@profesor.duoc.cl')) {
          this.navCtrl.navigateForward('docente');
        } else if (this.correo.endsWith('@duocuc.cl')) {
          this.navCtrl.navigateForward('/alumno');
        }
      }
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Credenciales incorrectas.',
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

  // Método para cerrar sesión y eliminar los datos de localStorage
  logout() {
    // Eliminar los datos del usuario de localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userUID');
    localStorage.removeItem('userName');
    console.log('Sesión cerrada');
    
    // Redirigir al login después de cerrar sesión
    this.navCtrl.navigateBack('/login');
  }
}
