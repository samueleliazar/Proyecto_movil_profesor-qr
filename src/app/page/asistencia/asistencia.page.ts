import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
interface ClaseData {
  id_profesor: string;
  id_ramo: string;
}
@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {
  claseId: string = ''; // UID del documento de la clase
  alumnos: any[] = []; // Lista de alumnos con su información formateada

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore) { }

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
      // Cargar los alumnos presentes (asistencia)
      const alumnosPresentesSnapshot = await this.firestore
        .collection('asistencia')
        .doc(this.claseId)
        .collection('Alumnos')
        .get()
        .toPromise();

      if (!alumnosPresentesSnapshot) {
        console.error('No se pudo cargar la lista de alumnos presentes.');
        return;
      }

      const alumnosPresentes: any[] = alumnosPresentesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          nombreCompleto: `${data['nombre'] || ''} ${data['apellido'] || ''}`.trim(),
          asistencia: 'Asistió',
        };
      });

      // Obtener el ID del profesor y del ramo desde la clase
      const claseSnapshot = await this.firestore.collection('asistencia').doc(this.claseId).get().toPromise();

      if (!claseSnapshot?.exists) {
        console.error('No se encontró la clase especificada.');
        return;
      }

      const claseData = claseSnapshot.data() as ClaseData;

      if (!claseData.id_profesor || !claseData.id_ramo) {
        console.error('Faltan datos de profesor o ramo en la clase.');
        return;
      }

      const profesorId = claseData.id_profesor;
      const ramoId = claseData.id_ramo;

      if (!profesorId || !ramoId) {
        console.error('Faltan datos de profesor o ramo en la clase.');
        return;
      }

      // Cargar la lista completa de estudiantes del ramo
      const estudiantesSnapshot = await this.firestore
        .collection('profesores')
        .doc(profesorId)
        .collection('ramos')
        .doc(ramoId)
        .collection('estudiantes')
        .get()
        .toPromise();

      if (!estudiantesSnapshot) {
        console.error('No se pudo cargar la lista de estudiantes.');
        return;
      }

      const estudiantesTotales: any[] = estudiantesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          nombreCompleto: `${data['nombre'] || ''} ${data['apellido'] || ''}`.trim(),
        };
      });

      // Determinar los alumnos ausentes
      const alumnosAusentes = estudiantesTotales.filter(estudiante => {
        return !alumnosPresentes.some(presente => presente.uid === estudiante.uid);
      }).map(ausente => ({
        ...ausente,
        asistencia: 'Ausente',
      }));

      // Combinar los presentes y los ausentes
      this.alumnos = [...alumnosPresentes, ...alumnosAusentes];

      console.log('Datos de los alumnos procesados:', this.alumnos);
    } catch (error) {
      console.error('Error al cargar los datos de los alumnos:', error);
    }
  }
}