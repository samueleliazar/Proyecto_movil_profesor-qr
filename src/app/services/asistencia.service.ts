import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  constructor(private firestore: AngularFirestore) {}

  // Método para registrar la asistencia en Firestore
  registrarAsistencia(ramoId: string, alumnoId: string) {
    const fecha = new Date();

    // Crear un objeto con los datos de la asistencia
    const asistencia = {
      ramoId,
      alumnoId,
      fecha: fecha.toISOString(),  // Guardamos la fecha y hora de la asistencia
      timestamp: fecha.getTime()   // Timestamp para ordenar por tiempo
    };

    // Agregar los datos de la asistencia a la colección 'asistencias'
    return this.firestore.collection('asistencias').add(asistencia)
      .then(() => console.log('Asistencia registrada correctamente'))
      .catch(error => console.error('Error al registrar asistencia: ', error));
  }
}

