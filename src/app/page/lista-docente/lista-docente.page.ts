import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from 'src/app/user.service';
import { Asistencia } from 'src/app/interfaces/asistencia';
import { Subscription } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

type Ramo = 'Inglés' | 'Matemáticas' | 'Programación' | 'Base de Datos';

// Mapa de nombres de ramos a sus correspondientes qr_id
const ramoMap: { [key in Ramo]: string } = {
  'Inglés': 'QR para INU201',
  'Matemáticas': 'QR para MATH101',
  'Programación': 'QR para PGY301',
  'Base de Datos': 'QR para BDD401'
};

@Component({
  selector: 'app-lista-docente',
  templateUrl: './lista-docente.page.html',
  styleUrls: ['./lista-docente.page.scss'],
})

export class ListaDocentePage implements OnInit, OnDestroy {
  alertButtons = ['Aceptar'];
  selectedRamo: string = '';
  asistenciaPorRamo: any[] = [];
  ramos: string[] = [];
  private asistenciaSubscription!: Subscription;
  searchTerm: string = '';  // Término de búsqueda

  constructor(
    private alertController: AlertController,
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadRamos();
    this.loadAsistenciaPorRamo();
  }
  loadRamos() {
    this.firestore.collection('profesores').snapshotChanges().subscribe(snapshot => {
      this.ramos = [];  // Limpiar la lista antes de agregar nuevos datos
      snapshot.forEach(doc => {
        const data: any = doc.payload.doc.data();  // Cast a `any`
        
        if (data && data['nombre'] && data['ramo']) {
          this.ramos.push(data['ramo']);
        }
      });
      console.log('Ramos cargados:', this.ramos);
    });
  }
  loadAsistenciaPorRamo() {
    if (this.selectedRamo) {
      console.log('Ramo seleccionado:', this.selectedRamo);

      // Obtener el qr_id correspondiente al ramo seleccionado
      const ramoId = ramoMap[this.selectedRamo as Ramo];
      
      // Comprobar si se encontró un qr_id para el ramo seleccionado
      if (ramoId) {
        console.log('Consultando por qr_id:', ramoId);

        this.firestore.collection('asistencia', ref =>
          ref.where('qr_id', '==', ramoId)  // Filtrar por qr_id correspondiente al ramo
        ).snapshotChanges().subscribe(snapshot => {
          this.asistenciaPorRamo = [];  // Limpiar la lista antes de llenarla

          // Verificar si se encontraron documentos
          if (snapshot.length === 0) {
            console.log('No se encontraron documentos para el ramo seleccionado.');
          }

          snapshot.forEach(doc => {
            const data = doc.payload.doc.data() as any;

            // Verificar que los datos contienen las propiedades necesarias
            if (data && data['nombre_alumno'] && data['date']) {
              this.asistenciaPorRamo.push({
                date: this.convertToDate(data['date']),
                studentName: data['nombre_alumno']
              });
            } else {
              console.warn('Datos incompletos o inválidos en el documento:', data);
            }
          });

          console.log('Asistencia cargada:', this.asistenciaPorRamo);
        }, error => {
          console.error('Error al cargar la asistencia:', error);
        });
      } else {
        console.warn('No se encontró un qr_id para el ramo seleccionado.');
      }
    } else {
      console.warn('No se ha seleccionado un ramo');
    }
  }

  convertToDate(date: any): Date | null {
    if (!date) return null;  // Retorna null si 'date' es null o undefined
    if (date instanceof Timestamp) {
      const convertedDate = date.toDate();
      console.log('Fecha convertida:', convertedDate);
      return convertedDate;
    }
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    return null;
  }

  onRamoChange(event: any) {
    this.selectedRamo = event.target.value;
    console.log('Ramo seleccionado:', this.selectedRamo);
    this.loadAsistenciaPorRamo();
  }

  onIonInfinite(ev: InfiniteScrollCustomEvent) {
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  async guardar_list() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La lista se guardó correctamente.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            this.router.navigate(['/docente']);
          },
          cssClass: 'alert-button-white',
        },
      ],
    });

    alert.cssClass = 'custom-alert';
    await alert.present();
  }

  ngOnDestroy() {
    if (this.asistenciaSubscription) {
      this.asistenciaSubscription.unsubscribe();
    }
  }

  // Método para filtrar la lista según el término de búsqueda
  filterList() {
    // Puedes agregar lógica para filtrar la lista si es necesario.
  }
}
