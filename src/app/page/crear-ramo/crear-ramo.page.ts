import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';  // Para interactuar con Firestore
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-crear-ramo',
  templateUrl: './crear-ramo.page.html',
  styleUrls: ['./crear-ramo.page.scss'],
})
export class CrearRamoPage implements OnInit {
  nombre_ramo: string ='';
  sigla: string = '';
  fecha_inicio: string = '';
  fecha_termino: string ='';
  profesorId: string = 'profesor-id-aqui';

  constructor(private navCtrl: NavController, private firestore: AngularFirestore, private afAuth: AngularFireAuth) { }

  goTocrear_ramo() {
    this.navCtrl.navigateForward('/crear-ramo')
  }
  ngOnInit() {  
    this.afAuth.onAuthStateChanged((user: firebase.User | null) => {
      if (user) {
        this.profesorId = user.uid; // Aquí obtenemos el UID del profesor autenticado
      }
    });
  }

  crearRamo() {
    if (this.nombre_ramo && this.sigla && this.fecha_inicio && this.fecha_termino) {
      const ramoId = `QR_${this.sigla}`.toUpperCase();  // Aquí estamos generando el qr_id
      const nuevoRamo = {
        nombre: this.nombre_ramo,
        sigla: this.sigla,
        fecha_inicio: this.fecha_inicio,
        fecha_termino: this.fecha_termino,
        qr_id: ramoId,  // Este es el qr_id que estamos generando
      };
  
      if (this.profesorId) {
        // Usamos `doc(ramoId)` para asegurarnos de que el documento en la subcolección 'ramos' tenga el ID 'QR_INU500'
        this.firestore.collection('profesores')
          .doc(this.profesorId)  // Accedemos al documento del profesor
          .collection('ramos')   // Accedemos a la subcolección 'ramos'
          .doc(ramoId)           // Usamos el qr_id como el ID del documento
          .set(nuevoRamo)        // Usamos `set` para guardar los datos
          .then(() => {
            console.log('Nuevo ramo creado con éxito');
            this.navCtrl.navigateForward('/asignatura-qr');
          })
          .catch((error) => {
            console.error('Error al crear el ramo:', error);
          });
      } else {
        console.error('No se ha encontrado un usuario autenticado.');
      }
    } else {
      console.log('Por favor, completa todos los campos correctamente.');
    }
  }
}
