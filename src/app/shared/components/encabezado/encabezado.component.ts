import { Component, OnInit, Input } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-encabezado',
  templateUrl: './encabezado.component.html',
  styleUrls: ['./encabezado.component.scss'],
})
export class EncabezadoComponent  implements OnInit {

  constructor(private navCtrl: NavController) {}

  @Input() titulo: string ='';
  
  ngOnInit() {
    console.log(this.titulo);
  }

  goToperfil() {
    this.navCtrl.navigateForward('/perfil')
  }
}
