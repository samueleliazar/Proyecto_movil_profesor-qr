import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app'; 
import QRCode from 'qrcode';
import { UserService } from 'src/app/user.service';  

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
  qrCode: string = ''; 
  qr_id: string = ''; 

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
      this.hola = `QR para ${this.ramo}`;
      this.getRamoInfo();  
    });
  }

  async getRamoInfo() {
    try {
      const user = await this.userService.getUser();
      const profesorUid = user?.uid; 

      if (!profesorUid) {
        console.log("No se encontró el uid del profesor.");
        return;
      }


      const ramoDoc = await this.firestore
        .collection('profesores') 
        .doc(profesorUid)  
        .collection('ramos')  
        .doc(this.ramo)  
        .get()
        .toPromise();

      if (ramoDoc && ramoDoc.exists) {
        const ramoData = ramoDoc.data() as RamoData; 
        if (ramoData) {
          this.qr_id = ramoData.qr_id || '';  
          console.log("QR ID del ramo:", this.qr_id);

          // Generamos el código QR con el qr_id
          if (this.qr_id) {
            this.generateQRCode(this.qr_id);  
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
    QRCode.toDataURL(qr_id, (err: Error | null, url: string) => {
      if (err) {
        console.error('Error generando QR:', err);
      } else {
        this.qrCode = url;
        console.log('QR generado con éxito:', url);  
      }
    });
  }

  scanQrCode(ramo: string, studentId: string) {
    this.firestore.collection('asistencia').add({
      estado: 'pendiente',  // El estado inicial
      fecha: firebase.firestore.FieldValue.serverTimestamp(),  
      hora_registro: firebase.firestore.FieldValue.serverTimestamp(), 
      id_estudiante: studentId,  
      qr_id: this.qr_id,  
      ramo: ramo,  
    }).then((docRef) => {
      console.log('Documento de asistencia registrado, ID:', docRef.id);
      
      this.updateAsistenciaState(docRef.id, 'registrado');
    }).catch((error) => {
      console.error('Error al registrar la asistencia:', error);
    });
  }

  updateAsistenciaState(docId: string, estado: string) {
    this.firestore.collection('asistencia').doc(docId).update({
      estado: estado,
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
