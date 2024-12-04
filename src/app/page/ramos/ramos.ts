import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController } from '@ionic/angular';

// Interfaz para los datos del usuario
interface User {
  correo: string;
}

// Interfaz para los datos del ramo
interface Ramo {
  id?: string; // ID opcional
  nombre?: string; // Nombre del ramo
  qr_id?: string; // ID QR del ramo
}

// Interfaz para la asistencia
interface Asistencia {
  id_ramo: string;
}

@Component({
  selector: 'app-ramos',
  templateUrl: './ramos.page.html',
  styleUrls: ['./ramos.page.scss'],
})
export class RamosPage implements OnInit {
  ramos: Ramo[] = []; // Aquí almacenamos los ramos en los que está inscrito el estudiante
  asistencias: { [idRamo: string]: string } = {}; // Objeto para almacenar las asistencias en formato "asistidas/totales"

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
      if (!user) {
        console.error('No hay un usuario autenticado.');
        return;
      }

      const uid = user.uid; // UID del estudiante autenticado
      this.ramos = []; // Limpiar la lista de ramos antes de cargar nuevos
      this.asistencias = {}; // Limpiar la lista de asistencias antes de cargar nuevas

      // Paso 1: Obtener los UIDs de los profesores
      const usersSnapshot = await this.firestore
        .collection<User>('users', (ref) =>
          ref.where('correo', '>=', 'a').where('correo', '<=', '\uf8ff')
        )
        .get()
        .toPromise();

      if (!usersSnapshot || usersSnapshot.empty) {
        console.warn('No se encontraron usuarios en la colección "users".');
        return;
      }

      const profesorUIDs: string[] = usersSnapshot.docs
        .filter((userDoc) => {
          const userData = userDoc.data() as User;
          return userData.correo?.endsWith('@profesor.duoc.cl');
        })
        .map((userDoc) => userDoc.id);

      console.log('UIDs de profesores encontrados:', profesorUIDs);

      // Paso 2: Buscar en la colección "profesores" los ramos de estos profesores
      for (const profesorUID of profesorUIDs) {
        const ramosSnapshot = await this.firestore
          .collection<Ramo>(`profesores/${profesorUID}/ramos`)
          .get()
          .toPromise();

        if (!ramosSnapshot || ramosSnapshot.empty) {
          console.log(`El profesor con UID ${profesorUID} no tiene ramos registrados.`);
          continue;
        }

        // Paso 3: Buscar si el estudiante está inscrito en cada ramo
        for (const ramoDoc of ramosSnapshot.docs) {
          const ramoData = ramoDoc.data();
          const estudiantesRef = ramoDoc.ref.collection('estudiantes');
          const estudianteSnapshot = await estudiantesRef.doc(uid).get();

          if (estudianteSnapshot?.exists) {
            console.log(`El estudiante está inscrito en el ramo ${ramoDoc.id}.`);

            // Guardar el qr_id dentro del ramo (si no existe, agregarlo)
            const qrId = ramoData.qr_id || ramoDoc.id; // Usa el ID del ramo si no tiene `qr_id`
            await ramoDoc.ref.update({ qr_id: qrId });

            this.ramos.push({
              id: ramoDoc.id,
              nombre: ramoData.nombre,
              qr_id: qrId,
            });

            // Paso 4: Calcular asistencias
            await this.calcularAsistencias(ramoDoc.id, uid);
          } else {
            console.log(`El estudiante NO está inscrito en el ramo ${ramoDoc.id}.`);
          }
        }
      }

      // Log final de los ramos encontrados
      if (this.ramos.length === 0) {
        console.log('No estás inscrito en ningún ramo.');
      } else {
        console.log('Ramos encontrados:', this.ramos);
        console.log('Asistencias calculadas:', this.asistencias);
      }
    } catch (error) {
      console.error('Error al cargar los ramos:', error);
    }
  }

  async calcularAsistencias(idRamo: string, uid: string) {
    try {
      const asistenciaSnapshot = await this.firestore
        .collection<Asistencia>('asistencia', (ref) =>
          ref.where('id_ramo', '==', idRamo)
        )
        .get()
        .toPromise();

      if (!asistenciaSnapshot || asistenciaSnapshot.empty) {
        console.log(`No se encontraron registros de asistencia para el ramo ${idRamo}.`);
        this.asistencias[idRamo] = '0/0'; // Sin registros de asistencia
        return;
      }

      let totalClases = 0;
      let clasesAsistidas = 0;

      // Iterar por los documentos de asistencia
      for (const asistenciaDoc of asistenciaSnapshot.docs) {
        totalClases++; // Incrementar el total de clases

        // Buscar en la subcolección "Alumnos" el UID del estudiante
        const alumnoSnapshot = await asistenciaDoc.ref
          .collection('Alumnos')
          .doc(uid)
          .get();

        if (alumnoSnapshot.exists) {
          clasesAsistidas++; // Incrementar las clases asistidas si el documento existe
        }
      }

      // Guardar el resultado en el formato "asistidas/totales"
      this.asistencias[idRamo] = `${clasesAsistidas}/${totalClases}`;
    } catch (error) {
      console.error(`Error al calcular asistencias para el ramo ${idRamo}:`, error);
    }
  }
}
