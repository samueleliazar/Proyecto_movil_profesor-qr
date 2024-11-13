import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';  // Para interactuar con Firestore
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
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

  constructor(private navCtrl: NavController, private firestore: AngularFirestore) { }

  goTocrear_ramo() {
    this.navCtrl.navigateForward('/crear-ramo')
  }
  ngOnInit() {
  }

  crearRamo() {
    if (this.nombre_ramo && this.sigla && this.fecha_inicio && this.fecha_termino) {
      // Crear un ID único para el ramo (puedes usar el nombre y sigla o generarlo automáticamente)
      const ramoId = `${this.sigla}-${this.nombre_ramo}`.toUpperCase();

      // Crear un nuevo objeto de ramo con los datos del formulario
      const nuevoRamo = {
        nombre: this.nombre_ramo,
        sigla: this.sigla,
        fecha_inicio: this.fecha_inicio,
        fecha_termino: this.fecha_termino,
        qr_id: ramoId,  // Este será el ID único para el ramo, puedes usar otro formato si prefieres
      };

      // Guardar el nuevo ramo en la base de datos dentro de la colección 'profesores'
      this.firestore.collection('profesores').doc(this.profesorId).collection('ramos').add(nuevoRamo)
        .then(() => {
          console.log('Nuevo ramo creado con éxito');
          this.navCtrl.navigateForward('/lista-docente');  // Redirigir a la lista de docentes o donde desees
        })
        .catch((error) => {
          console.error('Error al crear el ramo:', error);
        });
    } else {
      console.log('Por favor, completa todos los campos correctamente.');
    }
  }
}
