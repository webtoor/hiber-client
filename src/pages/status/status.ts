import { Component } from '@angular/core';
import { App, MenuController, NavController, NavParams, LoadingController, AlertController, PopoverController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { WelcomePage } from '../welcome/welcome';
import { Proyek1Page } from '../proyek1/proyek1';
import { StatussortPage } from '../statussort/statussort';
import { HubungiProviderPage } from '../hubungi-provider/hubungi-provider';
import { HistoryProjectPage } from '../history-project/history-project';


/**
 * Generated class for the StatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

/* @IonicPage() */
@Component({
  selector: 'page-status',
  templateUrl: 'status.html',
})
export class StatusPage {
  subject: any;
  public userDetails: any;
  public responseData: any;
  public items: any;
  loading: any;
  order_id: any;
  gunakans: any = { "status": "2", "provider_id": "" }
  filter: string;

  constructor(public popoverCtrl: PopoverController, public menu: MenuController, public loadingCtrl: LoadingController, public authService: AuthServiceProvider, public app: App, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams) {
    this.subject = navParams.get('subject');
    this.order_id = navParams.get('order_id');

    this.menu.swipeEnable(false);
    const data = JSON.parse(localStorage.getItem('userHiber'));
    this.userDetails = data;
    this.filter = '1';

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StatusPage');
    this.getProposal();
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(StatussortPage);
    popover.onDidDismiss(data => {
      console.log(data);
      if (data) {
        this.filter = data['kode']
        this.getProposal();
      }
    });
    popover.present({
      ev: myEvent
    });
  }

  showLoader() {
    this.loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Loading..',
    });

    this.loading.present();
  }

  backToWelcome() {
    let nav = this.app.getRootNav();
    nav.setRoot(WelcomePage);
  }

  getProposal() {
    this.showLoader()
    console.log(this.order_id)
    this.authService.getData('api/user/order_proposal/' + this.order_id + '/' + this.filter, this.userDetails['access_token']).then((result) => {
      this.responseData = result;
      console.log(this.responseData);
      if (this.responseData['success'] == true || this.responseData['success'] == false) {
        //localStorage.setItem('order_show', JSON.stringify(this.responseData['order']));
        this.items = this.responseData['data'];
        this.loading.dismiss()
      } else {
        this.loading.dismiss()
        localStorage.clear();
        setTimeout(() => this.backToWelcome(), 1000);
      }
    }, (err) => {
      this.loading.dismiss()
    });
  }

  gunakan(order_id: any, username: any, id: any) {
    this.gunakans.provider_id = id;
    console.log(this.gunakans)
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Anda setuju untuk menggunakan jasa ' + username + '?',
      buttons: [
        {
          text: 'Oke',
          handler: () => {
            this.authService.putData(this.gunakans, "api/user/order_status/" + order_id, this.userDetails['access_token']).then((result) => {
              this.responseData = result;
              console.log(this.responseData);
              if (this.responseData['success'] == true) {
                this.navCtrl.push(Proyek1Page, {
                  status: 1,
                });
              } else {
                localStorage.clear();
                setTimeout(() => this.backToWelcome(), 1000);
              }
            });
          }
        },
        {
          text: 'Kembali',
          handler: () => {
            console.log('Kembali clicked');
          }
        }
      ]
    });
    confirm.present();
  }

  hubungi(username: any, email: any, phonenumber: any) {
    this.navCtrl.push(HubungiProviderPage, {
      username: username,
      email: email,
      phone: phonenumber
    });
  }

  riwayat_project(id:any, username:any){
    this.navCtrl.push(HistoryProjectPage, {
      provider_id: id,
      username: username,
    });
  }

}
