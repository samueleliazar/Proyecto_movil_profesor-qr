import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app'; // Importar para usar serverTimestamp
import QRCode from 'qrcode';
import { UserService } from 'src/app/user.service';  // Asegúrate de importar el servicio

interface RamoData {
  qr_id: string;
}

@Component({
  selector: 'app-qr-genrated',
  templateUrl: './qr-genrated.page.html',
  styleUrls: ['./qr-genrated.page.scss'],
})
export class QrGenratedPage implements OnInit {
  hola: string = '';
  ramo: string = '';
  qrCode: string = ''; // Variable para guardar el QR generado
  qr_id: string = ''; // Variable para guardar el qr_id del ramo

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private userService: UserService  // Inyecta UserService en el constructor
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ramo = params['ramo'];
      console.log('Ramo recibido:', this.ramo); // Verifica el valor del ramo
      this.hola = `QR para ${this.ramo}`;
      this.getRamoInfo();  // Llamamos a la función para obtener la información del ramo
    });
  }

  async getRamoInfo() {
    try {
      // Obtener el uid del profesor desde la sesión de usuario o UserService
      const user = await this.userService.getUser(); // Obtener el usuario actual
      const profesorUid = user?.uid; // Obtener el uid del profesor

      if (!profesorUid) {
        console.log("No se encontró el uid del profesor.");
        return;
      }

      // Obtener el ramo del profesor usando su uid y el ramo (nombre del ramo o ID del ramo)
      const ramoDoc = await this.firestore
        .collection('profesores')  // Accedemos a la colección 'profesores'
        .doc(profesorUid)  // Obtenemos el documento del profesor
        .collection('ramos')  // Accedemos a la subcolección 'ramos'
        .doc(this.ramo)  // Usamos el nombre del ramo (asumido como ID)
        .get()
        .toPromise();

      if (ramoDoc && ramoDoc.exists) {
        const ramoData = ramoDoc.data() as RamoData;  // Extraemos los datos del ramo
        if (ramoData) {
          this.qr_id = ramoData.qr_id || '';  // Obtenemos el qr_id del ramo
          console.log("QR ID del ramo:", this.qr_id);

          // Generamos el código QR con el qr_id
          if (this.qr_id) {
            this.generateQRCode(this.qr_id);  // Generamos el QR solo si qr_id está disponible
          }
        } else {
          console.log("Datos del ramo no encontrados.");
        }
      } else {
        console.log("Ramo no encontrado.");
      }
    } catch (error) {
      console.error("Error obteniendo los datos del ramo:", error);
    }
  }

  generateQRCode(qr_id: string) {
    // Generamos el código QR que contiene qr_id (el identificador único del ramo)
    QRCode.toDataURL(qr_id, (err: Error | null, url: string) => {
      if (err) {
        console.error('Error generando QR:', err);
      } else {
        this.qrCode = url;
        console.log('QR generado con éxito:', url);  // Guardamos la URL de la imagen QR
      }
    });
  }

  scanQrCode(ramo: string, studentId: string) {
    // Cuando el QR es escaneado, se crea un documento en la colección 'asistencia' con los datos
    this.firestore.collection('asistencia').add({
      estado: 'pendiente',  // El estado inicial
      fecha: firebase.firestore.FieldValue.serverTimestamp(),  // Fecha de registro
      hora_registro: firebase.firestore.FieldValue.serverTimestamp(),  // Hora exacta de escaneo
      id_estudiante: studentId,  // ID del estudiante
      qr_id: this.qr_id,  // El ID del QR que escanearon
      ramo: ramo,  // El ramo correspondiente
    }).then((docRef) => {
      console.log('Documento de asistencia registrado, ID:', docRef.id);
      
      // Si deseas hacer algo adicional, como actualizar el estado más tarde
      this.updateAsistenciaState(docRef.id, 'registrado');  // Actualiza el estado cuando se valide la asistencia
    }).catch((error) => {
      console.error('Error al registrar la asistencia:', error);
    });
  }

  updateAsistenciaState(docId: string, estado: string) {
    // Actualiza el estado de la asistencia
    this.firestore.collection('asistencia').doc(docId).update({
      estado: estado,  // Cambia el estado a 'registrado' u otro valor
    }).then(() => {
      console.log('Estado de asistencia actualizado a:', estado);
    }).catch((error) => {
      console.error('Error al actualizar el estado de asistencia:', error);
    });
  }

  goTolista_docente() {
    this.navCtrl.navigateForward('/lista-docente');
  }
}
