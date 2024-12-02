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
        this.presentAlert(
          'Permiso denegado',
          'Se necesita permiso para acceder a la cámara.'
        );
        return;
      }

      const { barcodes } = await BarcodeScanner.scan();
      const barcodeData = barcodes[0]?.rawValue?.trim();
      if (!barcodeData) {
        await this.presentErrorAlert('No se encontró ningún dato en el QR.');
        return;
      }

      // Extraer los datos del QR: asistenciaId, ramoId y profesorUid
      const [asistenciaId, ramoId, profesorUid] = barcodeData.split('-');
      if (!asistenciaId || !ramoId || !profesorUid) {
        await this.presentErrorAlert(
          'El código QR no tiene un formato válido.'
        );
        return;
      }

      // Obtener el UID del estudiante autenticado
      const user = await this.auth.currentUser;
      if (!user) {
        await this.presentErrorAlert('Usuario no autenticado.');
        return;
      }

      const studentUid = user.uid;

      // Obtener el nombre del estudiante desde la colección "users"
      const userDoc = await this.firestore
        .collection('users')
        .doc(studentUid)
        .get()
        .toPromise();
      if (!userDoc || !userDoc.exists) {
        await this.presentErrorAlert(
          'No se encontró información del estudiante en la base de datos.'
        );
        return;
      }

      const userData = userDoc.data() as { nombre: string; apellido: string; correo: string };
      const { nombre, apellido, correo } = userData;

      if (!nombre || !apellido || !correo) {
        await this.presentErrorAlert('Datos incompletos del estudiante.');
        return;
      }

      // Verificar si existe el documento de asistencia
      const asistenciaDocRef = this.firestore
        .collection('asistencia')
        .doc(asistenciaId);
      const asistenciaDoc = await asistenciaDocRef.get().toPromise();

      if (!asistenciaDoc || !asistenciaDoc.exists) {
        await this.presentErrorAlert(
          'No se encontró el registro de asistencia en la base de datos.'
        );
        return;
      }

      // Verificar si el estudiante ya está registrado
      const alumnoRef = asistenciaDocRef
        .collection('Alumnos')
        .doc(studentUid);
      const alumnoDoc = await alumnoRef.get().toPromise();

      if (alumnoDoc && alumnoDoc.exists) {
        await this.presentErrorAlert(
          'Ya has registrado tu asistencia para esta clase.'
        );
        return;
      }

      // Registrar al estudiante en la subcolección "Alumnos"
      await alumnoRef.set({
        uid: studentUid,
        nombre,
        apellido,
        correo,
        asistencia: true,
      });

      console.log('Asistencia registrada correctamente para el estudiante:', studentUid);
      await this.presentSuccessAlert();
    } catch (error) {
      console.error('Error al registrar la asistencia:', error);
      await this.presentErrorAlert(
        'Hubo un error al intentar registrar la asistencia.'
      );
    }
  }

  async presentSuccessAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Asistencia registrada',
      message: 'La asistencia del estudiante ha sido registrada con éxito.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async presentAlert(
    header: string = 'Permiso denegado',
    message: string = 'Para usar la aplicación, autorice los permisos de cámara.'
  ): Promise<void> {
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
