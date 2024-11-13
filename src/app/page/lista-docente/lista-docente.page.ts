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
  ramos: any[] = [];
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
    // Obtener los datos del usuario actual (incluyendo el UID) usando async/await
    this.userService.getCurrentUserData().then(userData => {
      if (userData && userData.uid) {  // Verifica que el usuario tiene un uid
        const profesorId = userData.uid;  // Aquí obtienes el UID del profesor
    
        // Realizar la consulta usando el UID del profesor
        this.firestore.collection('profesores').doc(profesorId).collection('ramos').snapshotChanges().subscribe(snapshot => {
          this.ramos = [];  // Limpiar la lista de ramos
    
          snapshot.forEach(doc => {
            const data = doc.payload.doc.data() as any;
            if (data && data['nombre']) {
              this.ramos.push({
                nombre: data['nombre'],  // Nombre del ramo
                ramo: data['ramo']       // Información adicional del ramo
              });
            }
          });
        }, error => {
          console.error('Error al cargar los ramos:', error);
        });
      } else {
        console.warn('No se ha encontrado el ID del usuario');
        this.ramos = [];  // Limpiar los ramos si no hay usuario
      }
    }).catch(error => {
      console.error('Error al obtener los datos del usuario:', error);
    });
  }

  loadAsistenciaPorRamo() {
    if (this.selectedRamo) {
      const ramoId = ramoMap[this.selectedRamo as Ramo];
  
      // Comprobar si se encontró un qr_id para el ramo seleccionado
      if (ramoId) {
        this.firestore.collection('asistencia', ref =>
          ref.where('qr_id', '==', ramoId)  // Filtrar por qr_id correspondiente al ramo
        ).snapshotChanges().subscribe(snapshot => {
          this.asistenciaPorRamo = [];
  
          snapshot.forEach(doc => {
            const data = doc.payload.doc.data() as any;
            if (data && data['nombre_alumno'] && data['date']) {
              this.asistenciaPorRamo.push({
                date: this.convertToDate(data['date']),
                studentName: data['nombre_alumno']
              });
            }
          });
        });
      }
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

  async logout() {
    await this.userService.logout();  // Cerrar sesión del usuario
    this.ramos = [];  // Limpiar los ramos cuando el usuario cierre sesión
    this.asistenciaPorRamo = [];  // Limpiar la lista de asistencia
    console.log('Usuario cerrado sesión y ramos limpiados');
    this.router.navigate(['/login']);  // Redirigir a la página de login
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
