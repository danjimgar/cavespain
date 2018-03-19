import { Component } from '@angular/core';
import { PopoverController } from 'ionic-angular';

import { PopoverPage } from '../about-popover/about-popover';
import { HttpProvider } from '../../providers/http/http';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  conferenceDate = '2047-05-17';
  usuarios : any[];
  constructor(public popoverCtrl: PopoverController,  public http: HttpProvider) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  presentPopover(event: Event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ ev: event });
  }

  cargarUsuarios(){
    this.http.loadUsers().then(
      (res) => {
        this.usuarios = res['results'];
        console.log(this.usuarios);
      },
      (error) =>{
        console.error(error);
      }
    )
  }
}
