import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
    nombre: string ='';
    apellido: string = '';
    correo: string = '';
    contrasena: string ='';
    confirmarContrasena: string = '';

  constructor(
    private alertController: AlertController,
    private router: Router,
    private userService: UserService 
  ) {}

  ngOnInit() {}

  async Register() {
    if (this.validateFields()) {
      try {
        // Intentar registrar al usuario en Firebase
        const userCredential = await this.userService.registerUser(this.nombre, this.apellido ,this.correo, this.contrasena);    
        const user = userCredential.user;

        if (user) { // Verifica que user no sea null
          const uid = user.uid;
          const alumnoData = {
            UID: uid,
            Nombre: this.nombre,
            Apellido: this.apellido,
          };
          const alert = await this.alertController.create({
            header: 'Éxito',
            message: 'Se registró correctamente',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  this.router.navigate(['/home']);
                },
                cssClass: 'alert-button-white',
              },
            ],
          });
          alert.cssClass = 'custom-alert';
          await alert.present();
        } else {
          // Maneja el caso en que user sea null
          await this.showAlert('Error', 'No se pudo obtener la información del usuario.');
        }
      } catch (error) {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un error al registrarse. Verifique sus datos.',
          buttons: ['Aceptar'],
        });
        alert.cssClass = 'custom-alert';
        await alert.present();
      }
    }
  }

  validateFields(): boolean {
    const nombreValid = this.nombre.length > 3 && /^[a-zA-Z]+$/.test(this.nombre);
    const apellidoValid = this.apellido.length > 3 && /^[a-zA-Z]+$/.test(this.apellido);
    const correoValid = 
    this.correo.endsWith('@duocuc.cl') || 
    this.correo.endsWith('@profesor.duoc.cl');
    const contrasenaValid = this.contrasena.length > 8 
                            && /[A-Z]/.test(this.contrasena) 
                            && /[0-9]/.test(this.contrasena);

    if (!nombreValid) {
      this.showAlert('Error', 'El nombre debe tener más de 5 caracteres y no puede contener números ni símbolos.');
      return false;
    }

    if (!apellidoValid) {
      this.showAlert('Error', 'El apellido debe tener más de 5 caracteres y no puede contener números ni símbolos.');
      return false;
    }

    if (!correoValid) {
      this.showAlert('Error', 'El correo debe ser institucional (@duocuc.cl o @profesor.duoc.cl).');
      return false;
    }

    if (!contrasenaValid) {
      this.showAlert('Error', 'La contraseña debe tener más de 8 caracteres, al menos una mayúscula y un número.');
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
