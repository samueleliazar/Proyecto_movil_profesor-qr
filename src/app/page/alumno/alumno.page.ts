import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from 'src/app/user.service';
import { Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-alumno',
  templateUrl: './alumno.page.html',
  styleUrls: ['./alumno.page.scss'],
})
export class AlumnoPage implements OnInit {
  isSupported: boolean = false;
  barcodes: any[] = [];

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private userService: UserService,
    private router: Router,
    private navCtrl: NavController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });

    // Intentar sincronizar datos pendientes al cargar la página
    this.syncPendingAttendances();
  }

  async scanQRCode() {
    let asistenciaId: string | undefined;
    let ramoId: string | undefined;
    let profesorUid: string | undefined;

    try {
      const granted = await this.requestPermissions();
      if (!granted) {
        this.presentAlert(
          'Permiso denegado',
          'Se necesita permiso para acceder a la cámara.'
        );
        return;
      }

      // Escaneo del código QR
      const { barcodes } = await BarcodeScanner.scan();
      const barcodeData = barcodes[0]?.rawValue?.trim();
      if (!barcodeData) {
        await this.presentErrorAlert('No se encontró ningún dato en el QR.');
        return;
      }

      // Validación del formato de QR
      [asistenciaId, ramoId, profesorUid] = barcodeData.split('-');
      if (!asistenciaId || !ramoId || !profesorUid) {
        await this.presentErrorAlert('El código QR no tiene un formato válido.');
        return;
      }

      // Validación de usuario autenticado
      const user = await this.auth.currentUser;
      if (!user) {
        await this.presentErrorAlert('Usuario no autenticado.');
        return;
      }

      const studentUid = user.uid;

      // Recuperar datos del usuario desde Firestore
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

      // Registrar la asistencia
      await this.firestore
        .collection('asistencia')
        .doc(asistenciaId)
        .collection('Alumnos')
        .doc(studentUid)
        .set({
          uid: studentUid,
          nombre,
          apellido,
          correo,
          asistencia: true,
        });

      console.log('Asistencia registrada correctamente.');
      await this.presentSuccessAlert();
    } catch (error) {
      console.error('Error al registrar la asistencia:', error);

      const errorData = {
        asistenciaId: asistenciaId || '',
        ramoId: ramoId || '',
        profesorUid: profesorUid || '',
        timestamp: new Date().toISOString(),
      };
      this.saveToLocalStorage(errorData);

      await this.presentErrorAlert(
        'Hubo un error al intentar registrar la asistencia. Los datos se guardaron localmente.'
      );
    }
  }

  // Guardar asistencias pendientes localmente
  async saveToLocalStorage(data: any) {
    try {
      const localData = JSON.parse(localStorage.getItem('pendingAttendances') || '[]');
      localData.push(data);
      localStorage.setItem('pendingAttendances', JSON.stringify(localData));
      console.log('Datos guardados localmente:', data);
    } catch (error) {
      console.error('Error al guardar datos localmente:', error);
    }
  }

  // Sincronizar asistencias pendientes
  async syncPendingAttendances() {
    try {
      const localData = JSON.parse(localStorage.getItem('pendingAttendances') || '[]');

      if (localData.length === 0) {
        console.log('No hay datos pendientes para sincronizar.');
        return;
      }

      console.log(`Sincronizando ${localData.length} registros pendientes...`);

      for (const data of localData) {
        const { asistenciaId, ramoId, profesorUid } = data;

        if (!asistenciaId || !ramoId || !profesorUid) {
          console.warn('Datos incompletos encontrados en el local storage, omitiendo:', data);
          continue;
        }

        const user = await this.auth.currentUser;
        if (!user) {
          console.error('Usuario no autenticado. No se puede sincronizar la asistencia.');
          return;
        }

        const studentUid = user.uid;

        const userDoc = await this.firestore.collection('users').doc(studentUid).get().toPromise();
        if (!userDoc || !userDoc.exists) {
          console.error('No se encontró información del estudiante en la base de datos.');
          continue;
        }

        const userData = userDoc.data() as { nombre: string; apellido: string; correo: string };
        const { nombre, apellido, correo } = userData;

        if (!nombre || !apellido || !correo) {
          console.error('Datos incompletos del estudiante, omitiendo:', data);
          continue;
        }

        await this.firestore
          .collection('asistencia')
          .doc(asistenciaId)
          .collection('Alumnos')
          .doc(studentUid)
          .set({
            uid: studentUid,
            nombre,
            apellido,
            correo,
            asistencia: true,
          });

        console.log('Asistencia sincronizada correctamente:', data);
      }

      localStorage.removeItem('pendingAttendances');
      console.log('Datos locales sincronizados y eliminados.');
    } catch (error) {
      console.error('Error al sincronizar asistencias pendientes:', error);
    }
  }

  // Mostrar alertas
  async presentSuccessAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Asistencia registrada',
      message: 'La asistencia del estudiante ha sido registrada con éxito.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async presentAlert(header: string, message: string): Promise<void> {
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

  async presentErrorAlert(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Navegación
  goToRamos() {
    this.router.navigate(['/ramos']);
  }

  goToperfil() {
    this.navCtrl.navigateForward('/perfil');
  }
}
