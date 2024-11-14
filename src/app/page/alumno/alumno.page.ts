import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from 'src/app/user.service';
import { Timestamp } from 'firebase/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

interface UserData {
  nombre: string;
}

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
    private alertController: AlertController,
  ) {}

  isSupported: boolean = false;
  barcodes: any[] = [];

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
  }

  goToRamos() {
    this.router.navigate(['/ramos']);
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

      const qr_id = barcodeData.replace('QR para ', '').trim();
      const user = await this.auth.currentUser;

      if (user) {
        const uid = user.uid;

        const userDoc = await this.firestore.collection('users').doc(uid).get().toPromise();
        if (!userDoc || !userDoc.exists) {
          await this.presentErrorAlert('No se encontró el usuario en la base de datos');
          return;
        }

        const userData = userDoc.data() as UserData;
        const nombreAlumno = userData?.nombre || 'Desconocido';

        const asistenciaRef = this.firestore.collection('asistencia').doc(qr_id);
        await asistenciaRef.set({
          qr_id: qr_id,
          nombre_alumno: nombreAlumno,
          date: Timestamp.now(),
        });

        const professorUID = user.uid; // Obtén el UID del profesor de forma dinámica

        const ramoRef = this.firestore
          .collection('profesores')
          .doc(professorUID)
          .collection('ramos')
          .doc(qr_id);

        const ramoDoc = await ramoRef.get().toPromise();
        if (ramoDoc && ramoDoc.exists) {
          const ramoData = ramoDoc.data() as { nombre: string };
          const nombreRamo = ramoData?.nombre || 'Nombre no disponible';

          const estudiantesInscritosRef = asistenciaRef.collection('estudiantes_inscritos');
          const docSnapshot = await estudiantesInscritosRef.doc(uid).get().toPromise();

          if (!docSnapshot?.exists) {
            await estudiantesInscritosRef.doc(uid).set({
              nombre_alumno: nombreAlumno,
              uid: uid,
              nombre_ramo: nombreRamo,
            });
            console.log('Estudiante inscrito correctamente en el ramo:', nombreRamo);
            await this.presentSuccessAlert();
          } else {
            console.log('El estudiante ya está inscrito en este ramo.');
            await this.presentErrorAlert('Ya estás inscrito en este ramo.');
          }
        } else {
          console.log(`No se encontró el ramo con ID ${qr_id} en la subcolección 'ramos' del profesor`);
          await this.presentErrorAlert(`No se encontró el ramo en la base de datos.`);
        }
      } else {
        await this.presentErrorAlert('Usuario no autenticado.');
      }
    } catch (error) {
      console.error('Error al escanear el código QR', error);
      await this.presentErrorAlert('Hubo un error al intentar escanear el QR');
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
      buttons: ['OK']
    });
    await alert.present();
  }
  goToperfil(){
    this.navCtrl.navigateForward('/perfil')
  }
}
