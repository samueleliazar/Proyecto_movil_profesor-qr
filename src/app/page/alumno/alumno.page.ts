import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';  // Correcta importación
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from 'src/app/user.service';
import { Timestamp } from 'firebase/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

interface UserData {
  nombre: string;
  // Puedes agregar otras propiedades que tenga el documento de usuario
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

  // Redirige a la página de Ramos
  goToRamos() {
    this.router.navigate(['/ramos']); // Cambia '/ramos' por la ruta correspondiente
  }

  // Redirige a la página de la lista de alumnos
  goToListaAlumno() {
    this.router.navigate(['/lista-alumno']); // Cambia '/lista-alumno' por la ruta correspondiente
  }

  // Método para iniciar el escaneo del código QR
  async scanQRCode() {
    try {
      // Verificar permisos de cámara
      const granted = await this.requestPermissions(); // Solicitar permisos para la cámara
      if (!granted) {
        this.presentAlert('Se necesita permiso para acceder a la cámara.');
        return;
      }
  
      // Iniciar el escaneo del código QR
      const { barcodes } = await BarcodeScanner.scan();
      console.log('Datos escaneados:', barcodes); // Verifica los datos escaneados
  
      const barcodeData = barcodes[0]?.rawValue?.trim(); // Eliminar espacios extra
      console.log("QR data:", barcodeData); // Verifica lo que contiene el QR
  
      if (barcodeData) {
        // Limpiar el qr_id eliminando el prefijo "QR para " si existe
        const qr_id = barcodeData.replace('QR para ', '').trim();
        console.log('qr_id limpio:', qr_id);
  
        // Obtener el UID del usuario autenticado
        const user = await this.auth.currentUser;
        if (user) {
          const uid = user.uid;
  
          // Obtener el nombre del alumno desde Firestore
          const userDoc = await this.firestore.collection('users').doc(uid).get().toPromise();
          if (userDoc && userDoc.exists) {
            const userData = userDoc.data() as UserData;
            const nombreAlumno = userData?.nombre || 'Desconocido';
  
            // Registrar la asistencia en la colección 'asistencia'
            const asistenciaRef = this.firestore.collection('asistencia').doc(qr_id);  // Usamos el qr_id como el ID del documento
            await asistenciaRef.set({
              qr_id: qr_id,
              nombre_alumno: nombreAlumno,
              date: Timestamp.now(),
            });
            console.log('Asistencia registrada correctamente');
  
            // Ahora, registrar al estudiante en la subcolección 'estudiantes_inscritos'
            const estudiantesInscritosRef = asistenciaRef.collection('estudiantes_inscritos');
  
            // Verificar si el estudiante ya está inscrito
            const docSnapshot = await estudiantesInscritosRef.doc(uid).get().toPromise();
            if (!docSnapshot?.exists) {  // Si no existe el documento, es porque el estudiante no está inscrito
              await estudiantesInscritosRef.doc(uid).set({
                nombre_alumno: nombreAlumno,
                uid: uid,
              });
              console.log('Estudiante inscrito correctamente en el ramo');
            } else {
              console.log('El estudiante ya está inscrito en este ramo.');
              await this.presentErrorAlert('Ya estás inscrito en este ramo.');
            }
  
            // Mostrar alerta de éxito
            await this.presentSuccessAlert();
          } else {
            console.log('Error: No se encontró el usuario en Firestore');
            await this.presentErrorAlert('No se encontró el usuario en la base de datos');
          }
        } else {
          await this.presentErrorAlert('Usuario no autenticado.');
        }
      } else {
        console.log('Error: No se encontró ningún dato en el QR');
        await this.presentErrorAlert('No se encontró ningún dato en el QR');
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
    return camera === 'granted' || camera === 'limited'; // Ajuste para manejar el permiso 'limited'
  }

  async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
