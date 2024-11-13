import { Component, OnInit } from '@angular/core';
import { ItemList } from 'src/app/interfaces/itemlist';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-asignatura-qr',
  templateUrl: './asignatura-qr.page.html',
  styleUrls: ['./asignatura-qr.page.scss'],
})
export class AsignaturaQrPage implements OnInit {

  vinculos: ItemList[] = [];  // Ahora la lista estará vacía inicialmente
  constructor(private firestore: AngularFirestore) { }

  ngOnInit() {
    this.loadRamos();
  }

  loadRamos() {
    // Suscribirse a la colección de ramos del profesor en Firebase
    this.firestore.collection('profesores').doc('profesor-id-aqui')  // Cambia 'id_del_profesor' con el ID real del profesor
      .collection('ramos').snapshotChanges()
      .subscribe(snapshot => {
        this.vinculos = snapshot.map(doc => {
          const data = doc.payload.doc.data();
          return {
            ruta: '/qr-genrated/' + data['id'],  // Usar la notación de corchetes para acceder a la propiedad 'id'
            titulo: data['nombre'],  // Usar la notación de corchetes para acceder a la propiedad 'nombre'
            id: data['id'],  // Usar la notación de corchetes para acceder a la propiedad 'id'
            icono: 'school-outline'  // Puedes cambiar este icono si lo deseas
          } as ItemList;
        });
        console.log('Ramos cargados:', this.vinculos);  // Verificar que los ramos se carguen correctamente
      });
  }
}
