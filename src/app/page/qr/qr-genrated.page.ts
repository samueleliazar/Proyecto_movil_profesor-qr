import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app'; 
import QRCode from 'qrcode';
import { UserService } from 'src/app/user.service';  

@Component({
  selector: 'app-qr-genrated',
  templateUrl: './qr-genrated.page.html',
  styleUrls: ['./qr-genrated.page.scss'],
})
export class QrGenratedPage implements OnInit {
  qrCode: string = ''; 
  ramo: string = '';
  asistenciaDocId: string = ''; // ID del documento creado en asistencia

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private userService: UserService 
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ramo = params['ramo'];
      console.log('Ramo recibido:', this.ramo);
      this.generateAsistenciaAndQRCode();  
    });
  }

  // Crear el documento en la colección asistencia y generar el QR
  async generateAsistenciaAndQRCode() {
    try {
      const user = await this.userService.getUser();
      const profesorUid = user?.uid; 

      if (!profesorUid) {
        console.log("No se encontró el UID del profesor.");
        return;
      }

      // Crear un documento directamente en la colección asistencia
      const asistenciaRef = await this.firestore.collection('asistencia').add({
        id_profesor: profesorUid,    // UID del profesor
        id_ramo: this.ramo,         // UID del ramo
        fecha: firebase.firestore.FieldValue.serverTimestamp(),  // Fecha de creación
        hora_registro: firebase.firestore.FieldValue.serverTimestamp(), // Hora exacta
      });

      const asistenciaId = asistenciaRef.id; // ID generado para el documento en asistencia
      this.asistenciaDocId = asistenciaId;  // Guardar el ID para futuros usos
      console.log('Documento de asistencia creado con ID:', asistenciaId);

      // Generar el código QR con los datos del documento
      this.generateQRCode(asistenciaId, this.ramo, profesorUid);
    } catch (error) {
      console.error('Error al generar el documento de asistencia o QR:', error);
    }
  }

  // Generar el código QR
  generateQRCode(asistenciaId: string, ramoId: string, profesorUid: string) {
    // Formato del QR: asistenciaId, ramoId, profesorUid
    const qrData = `${asistenciaId}-${ramoId}-${profesorUid}`;
    
    QRCode.toDataURL(qrData, (err: Error | null, url: string) => {
      if (err) {
        console.error('Error generando QR:', err);
      } else {
        this.qrCode = url;
        console.log('QR generado con éxito:', url);
      }
    });
  }

  // Navegar a la lista de docentes
  goTolista_docente() {
    this.navCtrl.navigateForward('/lista-docente');
  }
}