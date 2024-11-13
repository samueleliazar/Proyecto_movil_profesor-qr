import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-docente',
  templateUrl: './docente.page.html',
  styleUrls: ['./docente.page.scss'],
})
export class DocentePage implements OnInit {

  constructor(private navCtrl: NavController) { }

  goToasignatura_qr() {
    this.navCtrl.navigateForward('/asignatura-qr')
  }
  goToasignatura() {
    this.navCtrl.navigateForward('/asignatura')
  }
  goTolista_docente() {
    this.navCtrl.navigateForward('/lista-docente')
  }
  goTocrear_ramo() {
    this.navCtrl.navigateForward('/crear-ramo')
  }

  ngOnInit() {
  }

}
