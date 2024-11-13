import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-verificacion',
  templateUrl: './verificacion.page.html',
  styleUrls: ['./verificacion.page.scss'],
})
export class VerificacionPage implements OnInit {

  constructor(private navCtrl: NavController) {}

  goToatras() {
    this.navCtrl.navigateForward('/alumno')
}

  ngOnInit() {
  }

}
