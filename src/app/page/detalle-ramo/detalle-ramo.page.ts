import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-detalle-ramo',
  templateUrl: './detalle-ramo.page.html',
  styleUrls: ['./detalle-ramo.page.scss'],
})
export class DetalleRamoPage implements OnInit {
  ramoId: string = ''; // Almacena el ID del ramo recibido de la URL
  profesorId: string = ''; // Almacena el ID del profesor activo
  clases: any[] = []; // Almacena las clases relacionadas con el ramo

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el id del ramo desde la URL
    this.ramoId = this.route.snapshot.paramMap.get('id') || '';
    this.profesorId = this.getProfesorId(); // Obtener el UID del profesor
    this.loadClasesPorRamo();
  }

  // Simula la obtención del UID del profesor activo
  getProfesorId(): string {
    // Reemplazar esto con la lógica real para obtener el profesorId (por ejemplo, desde un servicio de autenticación)
    return 'profesor123'; // Ejemplo estático, reemplazar según sea necesario
  }

  // Cargar las clases (asistencia) basadas en el id del ramo
  loadClasesPorRamo() {
    if (this.ramoId) {
      this.firestore.collection('asistencia', ref =>
        ref.where('id_ramo', '==', this.ramoId) // Filtrar por id_ramo
      ).snapshotChanges().subscribe(snapshot => {
        this.clases = []; // Limpiar las clases anteriores

        snapshot.forEach(doc => {
          const data = doc.payload.doc.data() as any;
          const id = doc.payload.doc.id; // Obtener el UID del documento
          if (data && data['fecha']) {
            this.clases.push({
              id, // UID del documento para identificarlo
              rawFecha: data['fecha'], // Fecha sin conversión
              formattedFecha: this.formatDate(this.convertToDate(data['fecha'])), // Fecha formateada para mostrar
            });
          }
        });
      });
    }
  }

  // Convertir el timestamp de Firebase a una fecha
  convertToDate(date: any): Date | null {
    if (!date) return null;
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    return null;
  }

  // Formatear la fecha en dd/MM/yyyy HH:mm
  formatDate(date: Date | null): string {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes empieza en 0
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  // Navegar a la página de asistencia con el UID del documento, ramo y profesor
  navigateToAsistencia(claseId: string) {
    this.router.navigate(['/asistencia'], {
      queryParams: { 
        id: claseId, // Enviar el UID del documento
        ramoId: this.ramoId, // Enviar el UID del ramo
        profesorId: this.profesorId // Enviar el UID del profesor
      },
    });
  }
}
