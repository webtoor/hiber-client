import { Component } from '@angular/core';
import { ViewController, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the StatussortPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

/* @IonicPage() */
@Component({
  selector: 'page-statussort',
  templateUrl: 'statussort.html',
})
export class StatussortPage {

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StatussortPage');
  }

  rating() {
    // Rating
    this.viewCtrl.dismiss({
      kode : '2'
    });
  }
  // Termurah
  termurah() {
    this.viewCtrl.dismiss({
      kode : '3'
    });
  }
  //Tertinggi
  termahal() {
    this.viewCtrl.dismiss({
      kode : '4'
    });
  }
}
