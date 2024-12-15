import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
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
  ramos: any[] = []; // Lista de todos los ramos
  filteredRamos: any[] = []; // Lista de ramos filtrados
  searchTerm: string = ''; // Término de búsqueda
  private asistenciaSubscription!: Subscription;

  constructor(
    private alertController: AlertController,
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadRamos();
  }

  /**
   * Carga los ramos creados por el profesor actual
   */
  async loadRamos() {

    const loading = await this.loadingController.create({
      message: 'Cargando ramos...', // Mensaje que aparecerá con el spinner
      spinner: 'crescent', // Tipo de spinner
      backdropDismiss: false, // Evita que el usuario pueda cerrar el spinner manualmente
    });

    // Muestra el spinner antes de cargar los datos
    await loading.present();

    this.userService.getCurrentUserData().then((userData) => {
      if (userData && userData.uid) {
        const profesorId = userData.uid;

        this.firestore
          .collection('profesores')
          .doc(profesorId)
          .collection('ramos')
          .snapshotChanges()
          .subscribe(
            (snapshot) => {
              this.ramos = snapshot.map((doc) => {
                const data = doc.payload.doc.data() as any;
                return {
                  nombre: data.nombre,
                  qr_id: data.qr_id,
                };
              });

              // Actualiza la lista filtrada al cargar
              this.filterList();
              
              loading.dismiss();
            },
            (error) => {
              console.error('Error al cargar los ramos:', error);
            }
          );
      } else {
        console.warn('No se encontró el ID del usuario');
        this.ramos = [];
        this.filteredRamos = [];
      }
    });
  }

  /**
   * Filtra la lista de ramos en base al término de búsqueda
   */
  filterList() {
    const searchTermLower = this.searchTerm.toLowerCase();

    this.filteredRamos = this.ramos.filter((ramo) =>
      ramo.nombre.toLowerCase().includes(searchTermLower)
    );
  }

  /**
   * Redirige al detalle de un ramo seleccionado
   * @param qr_id ID del ramo (QR ID)
   */
  goToRamoDetails(qr_id: string) {
    if (qr_id) {
      this.router.navigate(['/detalle-ramo', qr_id]); // Navega al detalle del ramo
    } else {
      console.error('El ID del ramo no es válido:', qr_id);
    }
  }

  ngOnDestroy() {
    if (this.asistenciaSubscription) {
      this.asistenciaSubscription.unsubscribe();
    }
  }
}