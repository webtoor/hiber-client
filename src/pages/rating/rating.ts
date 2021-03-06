import { Component } from '@angular/core';
import { App, MenuController, ToastController, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Proyek1Page } from '../proyek1/proyek1'
import { AuthServiceProvider } from '../../providers/auth-service/auth-service'
import { WelcomePage } from '../welcome/welcome'


/**
 * Generated class for the RatingPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-rating',
  templateUrl: 'rating.html',
})
export class RatingPage {
  User = {
    "writter" : "",
    "for" : "",
    "rating" : "",
    "comment" : "",
  };
  public userDetails : any;
  public responseData: any;
  public items : any;
  loading:any
  order_id:any;
  constructor(private toastCtrl: ToastController,public authService:AuthServiceProvider, public navCtrl: NavController, public navParams: NavParams, public menu: MenuController, public app: App, public loadingCtrl: LoadingController) {
     this.menu.swipeEnable(false);
     this.order_id = navParams.get('order_ids');
     const user = JSON.parse(localStorage.getItem('userHiber'));
     this.userDetails = user;
     this.getRating();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RatingPage');
  
  }
  rate(){
    this.User.writter = this.userDetails['id'];
    console.log(this.User);
    if (this.User.rating && this.User.comment) {
    this.authService.postData(this.User,'api/user/order_feedback/' + this.order_id, this.userDetails['access_token']).then((result)=>{
      this.responseData = result;
      console.log(this.responseData);
      if(this.responseData['success'] == true){
         let nav = this.app.getRootNav();
            nav.push(Proyek1Page, {
              finish : 1
            }); 
      }else{
        localStorage.clear();
        setTimeout(()=> this.backToWelcome(), 1000);  
      }
    }, (err) => {
       console.log('error')
    });
  }else{
      this.presentToast("Rating dan Saran/Kritik harap diisi!!");
    }
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      dismissOnPageChange: true
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
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
  getRating(){
    this.showLoader()
    this.authService.getData('api/user/get_rating/' + this.order_id, this.userDetails['access_token']).then((result)=>{
      this.responseData = result;
      //console.log(this.responseData['data']);
      if(this.responseData['success'] == true){
        this.items = this.responseData['data']['user']['username'];
        console.log(this.items)
        this.User.for = this.responseData['data']['provider_id'];
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
}
