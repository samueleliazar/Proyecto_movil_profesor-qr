import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'; // Correcta importación
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
        const qr_id = barcodeData; // Asignamos el valor completo del QR al qr_id
        console.log('qr_id:', qr_id);
  
        // Obtener el UID del usuario autenticado
        const user = await this.auth.currentUser;
        if (user) {
          const uid = user.uid;
  
          // Obtener el nombre del alumno desde Firestore
          const userDoc = await this.firestore.collection('users').doc(uid).get().toPromise();
          
          if (userDoc && userDoc.exists) {
            const userData = userDoc.data() as UserData;
            const nombreAlumno = userData?.nombre || 'Desconocido';
  
            // Registrar la asistencia con el qr_id, nombre del alumno, y otros datos
            await this.firestore.collection('asistencia').add({
              qr_id: qr_id,
              nombre_alumno: nombreAlumno, // Agregamos el nombre del alumno
              date: Timestamp.now(), // Usar Timestamp en lugar de new Date()
            });
  
            console.log('Asistencia registrada correctamente');
            await this.presentSuccessAlert(); // Mostrar alerta de éxito
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

  // Método para guardar la asistencia en la colección "asistencia"
  async saveAssistance(studentId: string, qrId: string) {
    try {
      const fecha = new Date(); // Fecha actual
      const horaRegistro = Timestamp.fromDate(fecha); // Hora de registro

      // Crear el documento en Firestore
      await this.firestore.collection('asistencia').add({
        estado: 'Presente', // Suponemos que el estado es 'Presente'
        fecha: fecha,
        hora_registro: horaRegistro,
        id_estudiante: studentId,
        qr_id: qrId,
        ramo: qrId, // Puedes ajustar esto si el ramo está almacenado en otro lugar
      });

      console.log('Asistencia registrada correctamente');
    } catch (error) {
      console.error('Error al guardar la asistencia:', error);
    }
  }
}
