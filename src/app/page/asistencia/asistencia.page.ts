import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {
  claseId: string = ''; // UID del documento de la clase
  alumnos: any[] = []; // Lista de alumnos con su información formateada

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore) {}

  ngOnInit() {
    // Obtener el UID del documento de la clase desde los queryParams
    this.route.queryParams.subscribe(params => {
      this.claseId = params['id'] || '';
      console.log('Clase ID recibido:', this.claseId); // Verificar el ID recibido
      if (this.claseId) {
        this.loadAlumnos();
      }
    });
  }

  // Cargar los datos de los alumnos desde la subcolección
  async loadAlumnos() {
    try {
      const alumnosSnapshot = await this.firestore
        .collection('asistencia') // Colección principal
        .doc(this.claseId) // Documento específico
        .collection('Alumnos') // Subcolección
        .get()
        .toPromise();

      if (alumnosSnapshot && !alumnosSnapshot.empty) {
        this.alumnos = alumnosSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            nombreCompleto: `${data['nombre']} ${data['apellido']}`, // Concatenar nombre y apellido
            asistencia: data['asistencia'] ? 'Asistió' : 'No Asistió', // Convertir booleano a texto
          };
        });
        console.log('Datos de los alumnos cargados:', this.alumnos); // Verificar datos procesados
      } else {
        console.log('No se encontraron alumnos en la subcolección.');
        this.alumnos = [];
      }
    } catch (error) {
      console.error('Error al cargar los datos de los alumnos:', error);
    }
  }
}