import { Component } from '@angular/core';
import { App, MenuController, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service'
import { PolygonPage } from '../polygon/polygon'
import { StatusPage } from '../status/status'
import { WelcomePage } from '../welcome/welcome'




/**
 * Generated class for the Proyek1baruPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-proyek1baru',
  templateUrl: 'proyek1baru.html',
})
export class Proyek1baruPage {
  proyekData : any
  public userDetails : any;
  public responseData: any;
  public items : any;
  loading:any
  cancels :any =  { "status" : "4", "provider_id" : ""}
  statuss : any;
  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, public navCtrl: NavController, public navParams: NavParams, public menu: MenuController, public authService:AuthServiceProvider, public app: App) {
    this.menu.swipeEnable(false);
    const data = JSON.parse(localStorage.getItem('userHiber'));
    this.userDetails = data;
    this.getProject();
  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Proyek1baruPage');

  }
  showLoader() {
    this.loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Loading..',
    });

    this.loading.present();
  }

  backToWelcome(){
    let nav = this.app.getRootNav();
    nav.setRoot(WelcomePage);
   }
  getProject(){
    this.showLoader()
    this.authService.getData('api/user/order_baru/' + this.userDetails['id'], this.userDetails['access_token']).then((result)=>{
      this.responseData = result;
      console.log(this.responseData);
      if(this.responseData['success'] == true){
        //localStorage.setItem('order_show', JSON.stringify(this.responseData['order']));
        this.items = this.responseData['order_baru'];
       /*  for(var index in this.items) { 
          if(this.items[index]['status_id'] == '1')
            this.statuss = this.items[index]['status_id'];
            //console.log(this.statuss);
      } */
        this.loading.dismiss()
      }else{
        this.loading.dismiss()
        localStorage.clear();
        setTimeout(()=> this.backToWelcome(), 1000);  
      }
    }, (err) => {
      this.loading.dismiss()
    });
}
      polygon(order_id:any, subject:any){
          //console.log(order_id)

          let nav = this.app.getRootNav();
          nav.push(PolygonPage, {
          order_id : order_id,
          subject : subject
        });
      }

    status(order_id:any, subject:any){
      //console.log(order_id)
      //console.log(subject)
      let nav = this.app.getRootNav();
      nav.push(StatusPage, {
      order_id : order_id,
      subject : subject
    });
    }

    cancel(order_id:any, subject:any){
      console.log(this.cancels)
    let confirm = this.alertCtrl.create({
      title: 'Konfirmasi',
      message: 'Apakah anda yakin untuk membatalkan order ' + subject + '?',
      buttons: [
        {
          text: 'Oke',
          handler: () => {
              this.authService.putData(this.cancels, "api/user/order_status/" + order_id, this.userDetails['access_token']).then((result) => {
              this.responseData = result;
              console.log(this.responseData);
              if(this.responseData['success'] == true){
                this.getProject();
              }else{
                 localStorage.clear();
                setTimeout(()=> this.backToWelcome(), 1000);  
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

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    this.getProject();
    refresher.complete();

  /*   setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000); */
  }
}
