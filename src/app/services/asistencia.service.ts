import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { Timestamp } from 'firebase/firestore';

interface Asistencia {
  nombre_ramo: string;
  // Puedes agregar otras propiedades si las tienes
}
@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  constructor(private firestore: AngularFirestore) {}

  // Método para registrar la asistencia en Firestore
  async registerAsistencia(qr_id: string, nombreAlumno: string, ramoId: string) {
    try {
      // Obtener el documento del ramo desde la subcolección 'ramos' dentro de la colección 'profesores'
      const ramoDocSnapshot = await this.firestore
        .collection('profesores')
        .doc(ramoId) // ID del profesor
        .collection('ramos')
        .doc(ramoId) // ID del ramo
        .get()
        .toPromise();
  
      // Verificar que el documento existe
      if (ramoDocSnapshot && ramoDocSnapshot.exists) {
        const nombreRamo = ramoDocSnapshot.data()?.['nombre'] || 'Nombre no disponible'; // Obtener el nombre del ramo
        console.log('Nombre del ramo:', nombreRamo);
  
        // Registrar la asistencia en la colección 'asistencia'
        const asistenciaRef = this.firestore.collection('asistencia').doc(qr_id);
        await asistenciaRef.set({
          qr_id: qr_id,
          nombre_alumno: nombreAlumno,
          nombre_ramo: nombreRamo, // Guardamos el nombre del ramo en la colección asistencia
          date: Timestamp.now(),
        });
        console.log('Asistencia registrada correctamente');
      } else {
        console.log('El documento del ramo no existe');
      }
    } catch (error) {
      console.error('Error al registrar la asistencia:', error);
    }
  }

  async obtenerRamosEstudiante(uid: string): Promise<any[]> {
    const ramos = [];

    try {
      // Obtener todos los documentos de la colección 'asistencia'
      const ramosRef = this.firestore.collection('asistencia');
      const ramosSnapshot = await ramosRef.get().toPromise();

      if (ramosSnapshot && !ramosSnapshot.empty) {
        for (let doc of ramosSnapshot.docs) {
          // Verificar si el estudiante está en la subcolección 'estudiantes_inscritos' de este ramo
          const estudiantesInscritosRef = doc.ref.collection('estudiantes_inscritos');
          const estudianteSnapshot = await estudiantesInscritosRef.doc(uid).get();

          if (estudianteSnapshot.exists) {
            // Obtener el qr_id (ID del documento en la colección asistencia)
            const qr_id = doc.id;

            // Buscar el nombre del ramo en la subcolección 'ramos' dentro de 'profesores'
            const profesorDocRef = this.firestore.collection('profesores').doc(qr_id);
            const ramoDocSnapshot = await profesorDocRef.collection('ramos').doc(qr_id).get().toPromise();

            // Asegurarse de que ramoDocSnapshot no sea undefined y contenga los datos
            if (ramoDocSnapshot?.exists) {
              const ramoData = ramoDocSnapshot.data() as Asistencia;  // Suponemos que el campo 'nombre_ramo' está en este documento
              const nombreRamo = ramoData?.nombre_ramo || 'Nombre no disponible';

              // Agregar el ramo y su nombre al arreglo
              ramos.push({
                id: doc.id,  // ID del ramo
                nombre: nombreRamo,  // Nombre del ramo obtenido
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al obtener los ramos:', error);
    }

    return ramos;
  }
}


