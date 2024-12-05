import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { UserService } from '../../user.service';
import { Storage } from '@ionic/storage-angular';

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
    private alertController: AlertController,
    private _storage: Storage
  ) {}

  async ngOnInit() {
    // Inicializar Ionic Storage
    await this._storage.create();

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
      // Validar credenciales en Ionic Storage
      const offlineUser = await this._storage.get('offlineUser');

      if (offlineUser) {
        // Verificar si los datos ingresados coinciden con los almacenados en Storage
        if (offlineUser.correo === this.correo && offlineUser.contrasena === this.contrasena) {
          // Verificar si el usuario existe en Firebase
          const userData = await this.userService.getUserById(offlineUser.correo).toPromise();
          if (!userData.exists) {
            // Si el usuario no existe, registrarlo en Firebase
            await this.userService.registerUser(
              offlineUser.nombre,
              offlineUser.apellido,
              offlineUser.correo,
              offlineUser.contrasena
            );
          }

          // Borrar los datos almacenados en Storage
          await this._storage.remove('offlineUser');
        }
      }

      // Intentar iniciar sesión en Firebase
      const userCredential = await this.userService.loginWithEmail(this.correo, this.contrasena);
      if (userCredential.user) {
        const user = userCredential.user;

        // Guardar datos en localStorage después de login exitoso
        localStorage.setItem('userEmail', user.email as string);
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
        message: 'Credenciales incorrectas o problema de conexión.',
        buttons: [
          {
            text: 'Aceptar',
            cssClass: 'alert-button-white'
          }]
          ,
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
