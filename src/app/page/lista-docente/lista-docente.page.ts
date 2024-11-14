import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from 'src/app/user.service';
import { Asistencia } from 'src/app/interfaces/asistencia';
import { Subscription } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

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
    this.userService.getCurrentUserData().then(userData => {
      if (userData && userData.uid) {
        const profesorId = userData.uid;
        
        this.firestore.collection('profesores').doc(profesorId).collection('ramos').snapshotChanges().subscribe(snapshot => {
          this.ramos = []; 
          
          snapshot.forEach(doc => {
            const data = doc.payload.doc.data() as any;
            if (data && data['nombre'] && data['qr_id']) {
              this.ramos.push({
                nombre: data['nombre'], 
                qr_id: data['qr_id']    
              });
            }
          });
        }, error => {
          console.error('Error al cargar los ramos:', error);
        });
      } else {
        console.warn('No se ha encontrado el ID del usuario');
        this.ramos = [];
      }
    }).catch(error => {
      console.error('Error al obtener los datos del usuario:', error);
    });
  }


  loadAsistenciaPorRamo() {
    if (this.selectedRamo) {
      const ramoSeleccionado = this.ramos.find(ramo => ramo.nombre === this.selectedRamo);
      
      if (ramoSeleccionado && ramoSeleccionado.qr_id) {
        const ramoId = ramoSeleccionado.qr_id;
    

        this.firestore.collection('asistencia', ref =>
          ref.where('qr_id', '==', ramoId) 
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
    if (!date) return null;  
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
    await this.userService.logout();  
    this.ramos = [];  
    this.asistenciaPorRamo = [];  
    console.log('Usuario cerrado sesión y ramos limpiados');
    this.router.navigate(['/login']);  
  }
  
  ngOnDestroy() {
    if (this.asistenciaSubscription) {
      this.asistenciaSubscription.unsubscribe();
    }
  }


  filterList() {
  }
}
