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

  vinculos: ItemList[] = [];  
  profesorId: string = '';
  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) { }

  ngOnInit() {
    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        this.profesorId = user.uid; 
        this.loadRamos(); 
      }
    });
  }

  loadRamos() {
    if (this.profesorId) {
      this.firestore.collection('profesores').doc(this.profesorId).collection('ramos').snapshotChanges()
        .subscribe(snapshot => {
          this.vinculos = snapshot.map(doc => {
            const data = doc.payload.doc.data();
            return {
              ruta: '/qr-genrated/' + data['qr_id'], 
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
