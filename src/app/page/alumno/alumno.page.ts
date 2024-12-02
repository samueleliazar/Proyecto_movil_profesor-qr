import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from 'src/app/user.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-alumno',
  templateUrl: './alumno.page.html',
  styleUrls: ['./alumno.page.scss'],
})
export class AlumnoPage implements OnInit {
  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private userService: UserService,
    private router: Router,
    private navCtrl: NavController,
    private alertController: AlertController
  ) {}

  isSupported: boolean = false;
  barcodes: any[] = [];

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
  }

  async scanQRCode() {
    try {
      const granted = await this.requestPermissions();
      if (!granted) {
        this.presentAlert('Se necesita permiso para acceder a la cámara.');
        return;
      }

      const { barcodes } = await BarcodeScanner.scan();
      const barcodeData = barcodes[0]?.rawValue?.trim();
      if (!barcodeData) {
        await this.presentErrorAlert('No se encontró ningún dato en el QR');
        return;
      }

      // Extraer los datos del QR: asistenciaId, ramoId y profesorUid
      const [asistenciaId, ramoId, profesorUid] = barcodeData.split('-');
      if (!asistenciaId || !ramoId || !profesorUid) {
        await this.presentErrorAlert('El código QR no tiene un formato válido.');
        return;
      }

      const user = await this.auth.currentUser;
      if (!user) {
        await this.presentErrorAlert('Usuario no autenticado.');
        return;
      }

      const studentUid = user.uid;

      // Obtener el nombre y datos del estudiante desde la colección "users"
      const userDoc = await this.firestore.collection('users').doc(studentUid).get().toPromise();
      if (!userDoc || !userDoc.exists) {
        await this.presentErrorAlert('No se encontró el usuario en la base de datos');
        return;
      }

      const userData = userDoc.data() as { nombre: string, apellido: string, correo: string };
      const { nombre, apellido, correo } = userData;

      // Verificar si existe el ramo del profesor
      const ramoRef = this.firestore
        .collection('profesores')
        .doc(profesorUid)
        .collection('ramos')  // Se cambió de 'Ramos' a 'ramos'
        .doc(ramoId);

      const ramoDoc = await ramoRef.get().toPromise();
      if (!ramoDoc || !ramoDoc.exists) {
        await this.presentErrorAlert('No se encontró el ramo en la base de datos.');
        return;
      }

      // Verificar si el estudiante ya está registrado en la subcolección Estudiantes
      const estudianteRef = ramoRef.collection('Estudiantes').doc(studentUid);
      const estudianteDoc = await estudianteRef.get().toPromise();

      if (estudianteDoc && estudianteDoc.exists) {
        console.log('El estudiante ya está registrado en la subcolección Estudiantes.');
      } else {
        console.log('Registrando al estudiante en la subcolección Estudiantes...');
        await estudianteRef.set({
          uid: studentUid,
          nombre,
          apellido,
          correo,
        });
        console.log('Estudiante registrado correctamente en la subcolección Estudiantes.');
      }

      // Aquí puedes continuar con el proceso de registrar la asistencia si es necesario
      await this.presentSuccessAlert();
    } catch (error) {
      console.error('Error durante el proceso:', error);
      await this.presentErrorAlert('Hubo un error al intentar registrar la información.');
    }
  }

  async presentSuccessAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Registro exitoso',
      message: 'El estudiante ha sido registrado correctamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async presentAlert(header: string = 'Permiso denegado', message: string = 'Para usar la aplicación autorizar los permisos de cámara'): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  goToRamos() {
    this.router.navigate(['/ramos']);
  }

  goToperfil() {
    this.navCtrl.navigateForward('/perfil');
  }
}
