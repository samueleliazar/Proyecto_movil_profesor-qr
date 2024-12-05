import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  contrasena: string = '';
  confirmarContrasena: string = '';
  private _storage: Storage | null = null;

  constructor(
    private alertController: AlertController,
    private router: Router,
    private userService: UserService,
    private storage: Storage
  ) {}

  async ngOnInit() {
    // Inicializar Ionic Storage
    this._storage = await this.storage.create();
  }

  async Register() {
    if (this.validateFields()) {
      try {
        const userCredential = await this.userService.registerUser(
          this.nombre,
          this.apellido,
          this.correo,
          this.contrasena
        );

        const user = userCredential.user;

        if (user) {
          // Si el registro es exitoso, redirigir al home
          this.router.navigate(['/home']);
        }
      } catch (error) {
        // Si ocurre un error, guardar datos en el Storage
        if (this._storage) {
          await this._storage.set('offlineUser', {
            nombre: this.nombre,
            apellido: this.apellido,
            correo: this.correo,
            contrasena: this.contrasena,
          });
        }

        // Redirigir al home
        this.router.navigate(['/home']);
      }
    }
  }

  validateFields(): boolean {
    const nombreValid = this.nombre.length > 3 && /^[a-zA-Z]+$/.test(this.nombre);
    const apellidoValid = this.apellido.length > 3 && /^[a-zA-Z]+$/.test(this.apellido);
    const correoValid =
      this.correo.endsWith('@duocuc.cl') || this.correo.endsWith('@profesor.duoc.cl');
    const contrasenaValid =
      this.contrasena.length > 8 &&
      /[A-Z]/.test(this.contrasena) &&
      /[0-9]/.test(this.contrasena);

    if (!nombreValid) {
      this.showAlert(
        'Error',
        'El nombre debe tener más de 5 caracteres y no puede contener números ni símbolos.'
      );
      return false;
    }

    if (!apellidoValid) {
      this.showAlert(
        'Error',
        'El apellido debe tener más de 5 caracteres y no puede contener números ni símbolos.'
      );
      return false;
    }

    if (!correoValid) {
      this.showAlert(
        'Error',
        'El correo debe ser institucional (@duocuc.cl o @profesor.duoc.cl).'
      );
      return false;
    }

    if (!contrasenaValid) {
      this.showAlert(
        'Error',
        'La contraseña debe tener más de 8 caracteres, al menos una mayúscula y un número.'
      );
      return false;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      this.showAlert('Error', 'Las contraseñas no coinciden.');
      return false;
    }

    return true;
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar'],
    });

    await alert.present();
  }
}
