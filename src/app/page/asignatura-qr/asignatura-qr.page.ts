import { Component, OnInit } from '@angular/core';
import { ItemList } from 'src/app/interfaces/itemlist';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-asignatura-qr',
  templateUrl: './asignatura-qr.page.html',
  styleUrls: ['./asignatura-qr.page.scss'],
})
export class AsignaturaQrPage implements OnInit {

  vinculos: ItemList[] = [];  // Ahora la lista estará vacía inicialmente
  profesorId: string = '';
  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) { }

  ngOnInit() {
    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        this.profesorId = user.uid; // Obtenemos el UID del usuario autenticado
        this.loadRamos(); // Cargamos los ramos correspondientes
      }
    });
  }

  loadRamos() {
    if (this.profesorId) {
      // Usamos el UID del profesor autenticado para obtener sus ramos
      this.firestore.collection('profesores').doc(this.profesorId).collection('ramos').snapshotChanges()
        .subscribe(snapshot => {
          this.vinculos = snapshot.map(doc => {
            const data = doc.payload.doc.data();
            return {
              ruta: '/qr-genrated/' + data['qr_id'],  // Usamos el qr_id como ruta
              titulo: data['nombre'],
              id: data['qr_id'],
              icono: 'school-outline'
            } as ItemList;
          });
          console.log('Ramos cargados:', this.vinculos);
        });
    }
  }
}
