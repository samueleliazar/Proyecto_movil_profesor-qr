import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController } from '@ionic/angular';

// Definir la interfaz para los datos del ramo
interface Ramo {
  nombre_alumno: string;
  // Agrega más campos si es necesario
}

@Component({
  selector: 'app-ramos',
  templateUrl: './ramos.page.html',
  styleUrls: ['./ramos.page.scss'],
})
export class RamosPage implements OnInit {
  ramos: any[] = []; // Aquí almacenamos los ramos

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.loadRamos(); // Cargar los ramos cuando la página se inicializa
  }

  async loadRamos() {
    try {
      const user = await this.auth.currentUser; // Obtener el usuario autenticado
      if (user) {
        const uid = user.uid;

        // Obtener todos los documentos de la colección 'asistencia'
        const ramosRef = this.firestore.collection('asistencia');

        const ramosSnapshot = await ramosRef.get().toPromise();
        
        if (ramosSnapshot && !ramosSnapshot.empty) {
          this.ramos = []; // Limpiar los ramos previos

          // Recorrer los documentos de los ramos
          for (let doc of ramosSnapshot.docs) {
            // Verificar si el estudiante está en la subcolección 'estudiantes_inscritos' de este ramo
            const estudiantesInscritosRef = doc.ref.collection('estudiantes_inscritos');
            const estudianteSnapshot = await estudiantesInscritosRef.doc(uid).get();

            // Si el documento existe, significa que el estudiante está inscrito
            if (estudianteSnapshot.exists) {
              const ramo = doc.data() as Ramo; // Obtenemos los datos del ramo
              this.ramos.push({
                id: doc.id, // ID del ramo
                nombre: ramo.nombre_alumno, // Nombre del ramo
              });
            }
          }

          if (this.ramos.length === 0) {
            console.log('No estás inscrito en ningún ramo.');
          }
        } else {
          console.log('No se encontraron ramos.');
        }
      }
    } catch (error) {
      console.error('Error al cargar los ramos:', error);
    }
  }
}
