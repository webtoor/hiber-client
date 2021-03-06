import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController  } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service'



/**
 * Generated class for the PolygonPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-polygon',
  templateUrl: 'polygon.html',
})
export class PolygonPage {
  @ViewChild('map') mapElement: ElementRef;
  map:any;
  public userDetails : any;
  public responseData:any;
  public outputs : any
  public order_id : any;
  subject : any;
  loading:any
  area:any;


  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public navParams: NavParams, public authService: AuthServiceProvider) {
    this.order_id = navParams.get('order_id');
    this.subject = navParams.get('subject');

    console.log(this.order_id) 
    const data = JSON.parse(localStorage.getItem('userHiber'));
    this.userDetails = data;
   
  }

  ionViewDidLoad(): void {
    this.loadMap();

}

  showLoader() {
    this.loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Loading..',
    });

    this.loading.present();
  }
  loadMap(){
      this.showLoader()
      this.authService.getData("api/user/polygon/"+ this.order_id, this.userDetails['access_token']).then((result) => {
      this.responseData = result;
      //this.dataSet = this.responseData.output
      console.log(this.responseData)
     
    let LatLng = new google.maps.LatLng(this.responseData['polygon'][0]['latitude'], this.responseData['polygon'][0]['longitude']);

    let mapOptions = {
      center:LatLng,
      zoom:17,
      MapTypeID: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      var arr = this.responseData['polygon'];
      var cords = []
      for (var i = 0; i < arr.length; i++) {
        cords.push(new google.maps.LatLng(parseFloat(this.responseData['polygon'][i]['latitude']), parseFloat(this.responseData['polygon'][i]['longitude'])));
      }
      //console.log(cords)
        var polygons = new google.maps.Polygon({
           paths: cords,
           map: this.map,
           strokeColor: '#000',
           strokeOpacity: 0.8,
           strokeWeight: 6,
           fillColor: 'green',
           fillOpacity: 0.35,
         });
         this.map.getBounds(cords);
         cords = [];

         this.outputs = []
         for(var j=0; j < this.responseData['output'].length; j++){
          if(this.responseData['output'][j]['output_id'] == '1'){
            this.outputs.push('Video')
          }else if(this.responseData['output'][j]['output_id'] == '2'){
            this.outputs.push ('Foto')
          }else if(this.responseData['output'][j]['output_id'] == '3'){
            this.outputs.push('Peta')
          }else if(this.responseData['output'][j]['output_id'] == '4'){
            this.outputs.push('Lain-lain')
          }
         }
         console.log(this.outputs)
      /*    var pathLeft = [new google.maps.LatLng(55.874, -4.292),
          new google.maps.LatLng(55.875, -4.292),
          new google.maps.LatLng(55.875, -4.290),
          new google.maps.LatLng(55.876, -4.290),
          new google.maps.LatLng(55.876, -4.291),
          new google.maps.LatLng(55.874, -4.291)] */

   /*    var polygonLeft = new google.maps.Polygon({
          paths : pathLeft,
          map: this.map
      }); */

      var luasArea = google.maps.geometry.spherical.computeArea(polygons.getPath());
      this.area = luasArea.toFixed(2)
      console.log(this.area)
         this.loading.dismiss()

        }, (err) => {
          this.loading.dismiss()
        });
    }   

  }
