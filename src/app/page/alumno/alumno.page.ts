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
    private alertCtrl: AlertController
  ) {}
  
  isSupported: boolean = false;
  barcodes: any[] = [];
  
  ngOnInit() {}

  async scanQRCode() {
    try {
      // Escanea el código QR
      const scanResult: any = await BarcodeScanner.startScan();

      // Verifica si el resultado tiene contenido
      if (!scanResult || !scanResult.content) {
        await this.presentAlert('No se detectó contenido en el código QR.');
        return;
      }

      const barcodeData = scanResult.content.trim();

      // Verificar y extraer datos del código QR
      const [asistenciaId, ramoId, profesorUid] = barcodeData.split('-');
      if (!asistenciaId || !ramoId || !profesorUid) {
        await this.presentAlert('El código QR no tiene un formato válido.');
        return;
      }

      // Obtener el UID del usuario autenticado
      const user = await this.auth.currentUser;
      if (!user) {
        await this.presentAlert('No se encontró un usuario autenticado.');
        return;
      }

      const studentUid = user.uid;

      // Obtener datos del estudiante desde la colección "users"
      const userDoc = await this.firestore.collection('users').doc(studentUid).get().toPromise();
      if (!userDoc || !userDoc.exists) {
        await this.presentAlert('No se encontró información del estudiante.');
        return;
      }

      const userData = userDoc.data() as { nombre: string; apellido: string; correo: string };
      const { nombre, apellido, correo } = userData;

      if (!nombre || !apellido || !correo) {
        await this.presentAlert('Los datos del estudiante están incompletos.');
        return;
      }

      // Crear la ruta en Firestore
      const profesorRef = this.firestore.collection('profesores').doc(profesorUid);
      const ramoRef = profesorRef.collection('ramos').doc(ramoId);
      const estudianteRef = ramoRef.collection('estudiantes').doc(studentUid);

      // Verificar si ya está registrado
      const estudianteDoc = await estudianteRef.get().toPromise();
      if (estudianteDoc && estudianteDoc.exists) {
        await this.presentAlert('Ya estás registrado en este ramo.');
        return;
      }

      // Registrar al estudiante
      await estudianteRef.set({
        uid: studentUid,
        nombre,
        apellido,
        correo,
      });

      console.log('Registro exitoso para el estudiante:', studentUid);
      await this.presentAlert('Registro exitoso.');
    } catch (error) {
      console.error('Error al escanear o registrar:', error);
      await this.presentAlert('Ocurrió un error al intentar registrar la asistencia.');
    }
  }

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Información',
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
