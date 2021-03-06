import { Injectable, ViewChild, ElementRef,  NgZone} from '@angular/core';

import { ToastController, NavController, App, Platform } from 'ionic-angular';
import { Connectivity } from '../connectivity-service/connectivity-service';
import { Geolocation } from '@ionic-native/geolocation';
import { Plan2Page} from '../../pages/plan2/plan2';

@Injectable()
export class GoogleMaps {
  private navCtrl: NavController;
  //@ViewChild('create-plan') nav: NavController;
  @ViewChild('area') Element: ElementRef;
  mapElement: any;
  pleaseConnect: any;
  map: any;
  pathstr:any;
  polyline:any;
  all_overlays = [];
  area : any;

  mapInitialised: boolean = false;
  mapLoaded: any;
  mapLoadedObserver: any;
  currentMarker: any;
  drawingManager: any;
  apiKey: string = "AIzaSyAkf6QLWDuZKt6OSsN-SofihM4KsMocFZs";
  selectedShape: any;



  constructor(public zone: NgZone, public platform: Platform, public app:App, public connectivityService: Connectivity, public geolocation: Geolocation, public toastCtrl: ToastController){
    this.navCtrl = app.getActiveNav();


  }

  init(mapElement: any, pleaseConnect: any): Promise<any> {

    this.mapElement = mapElement;
    this.pleaseConnect = pleaseConnect;

    return this.loadGoogleMaps();

  }

  loadGoogleMaps(): Promise<any> {

    return new Promise((resolve) => {

      if (typeof google == "undefined" || typeof google.maps == "undefined") {

        console.log("Google maps JavaScript needs to be loaded.");
        this.disableMap();

        if (this.connectivityService.isOnline()) {

          window['mapInit'] = () => {

            this.initMap().then(() => {
              resolve(true);
            });

            this.enableMap();
          }

          let script = document.createElement("script");
          script.id = "googleMaps";

          if (this.apiKey) {
            script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit&libraries=places,drawing,geometry';
          } else {
            script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
          }

          document.body.appendChild(script);

        }
      } else {

        if (this.connectivityService.isOnline()) {
          this.initMap();
          this.enableMap();
        }
        else {
          this.disableMap();
        }

        resolve(true);

      }

      this.addConnectivityListeners();

    });

  }

  clearSelection = (shape): void => {

    if(shape) {
      shape.setEditable(false);
      shape = null;
      this.selectedShape=shape
    }
  }

  setSelection = (shape): void => {

    this.clearSelection(shape);
    var shape = shape;
    this.selectedShape=shape;

    shape.setEditable(true);
    this.updateCurSelText(shape);
    console.log(this.pathstr);

  }

/*   deleteSelectedShape() {
    if (this.selectedShape) {
      this.selectedShape.setMap(null);
    }
  } */


  updateCurSelText(shape){
    this.pathstr = shape.getPath();
     if (shape.getPath()) {
     this.pathstr = "";
 
       for (var i = 0; i < shape.getPath().getLength(); i++) {
         this.pathstr += shape.getPath().getAt(i).toUrlValue() + ",";
       }
       this.pathstr += "";
       this.area = google.maps.geometry.spherical.computeArea(shape.getPath());
       console.log(this.area.toFixed(2));
     }


    //document.getElementById("hasil").innerHTML  = "<b>cursel</b>: " + this.selectedShape.type + " " + this.selectedShape  + " <i>path</i>: " + this.pathstr ;
  //( < HTMLScriptElement > document.getElementById("area")).text = 'asdadasd';
   //(document.getElementById("area") as HTMLInputElement).value = "dsadasda";
//document.getElementById('area').setAttribute("value", this.pathstr);


  //  (<HTMLInputElement>document.getElementById("area")).text = 'asjhdahgdaad';
//  (document.getElementById('area') as HTMLInputElement).value = 'asdasdasd';
  // document.getElementById("area").innerHTML = 'asdjhaksdjsgdahj' ;
  //var hasil = this.pathstr ;

  //console.log(hasil);
  }

  deleteAllShape() {
    for (var i=0; i < this.all_overlays.length; i++)
    {
      this.all_overlays[i].overlay.setMap(null);
    }
    this.all_overlays = [];
    this.pathstr = null;
    console.log(this.pathstr);
  }
  
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'middle'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }


  initMap(): Promise<any> {

    this.mapInitialised = true;

    return new Promise((resolve) => {
    var newShape

    let options = {maximumAge: 3000, timeout: 5000, enableHighAccuracy: true  };
    this.geolocation.getCurrentPosition(options).then((position) => {
       
     
    let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    
      //console.log(position.coords.latitude, position.coords.longitude)
   
      //let latLng = new google.maps.LatLng(-6.923668, 107.605011);
    
        let mapOptions = {
          center: latLng,
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true
        }
      
        this.map = new google.maps.Map(this.mapElement, mapOptions);
        resolve(true);

      /*   var marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: latLng
      }); */
        let polyOptions = {
         /*  strokeWeight: 2,
          strokeOpacity: 0.8,
          fillOpacity: 0.45, */
          strokeColor: '#000',
          strokeOpacity: 0.8,
          strokeWeight: 6,
          fillColor: 'green',
          fillOpacity: 0.35,
          editable: true,
        };

        var drawingManager = new google.maps.drawing.DrawingManager({
          drawingControl: false,
          drawingControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON,
            ]
          },
          polygonOptions: polyOptions,
          map: this.map
        });
        google.maps.event.addListener(drawingManager, 'overlaycomplete', (e) => {
          this.all_overlays.push(e);
            this.selectedShape=e.overlay

            if (e.type != google.maps.drawing.OverlayType.MARKER) {
          // Switch back to non-drawing mode after drawing a shape.
          drawingManager.setDrawingMode(null);

          // Add an event listener that selects the newly-drawn shape when the user
          // mouses down on it.
          newShape = e.overlay;
          newShape.type = e.type;
          google.maps.event.addListener(newShape, 'click', ()=> {
            this.setSelection(newShape);
          });

           this.setSelection(newShape);
        }
          });

          // Create Button
            google.maps.event.addDomListener(document.getElementById('create-button'), 'click', () => {
              if(!this.pathstr){
              drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            }else {
              this.presentToast('Hapus polygon terlebih dahulu');
            }
            });
             google.maps.event.addDomListener(document.getElementById('create-plan'), 'click', () => {
              if(this.pathstr != null){
                this.setSelection(newShape);
                this.navCtrl.push(Plan2Page,{
                  latlng : this.pathstr,
                  area : this.area.toFixed(2),
                });
              }else{
                  this.presentToast('Anda harus membuat polygon dahulu');
                }
              

            }); 
           google.maps.event.addListener(this.map, 'click', () => { this.clearSelection(newShape); }); 
           google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', () => { 
            this.deleteAllShape();
           });


          }).catch((err) => {
            let latLng = new google.maps.LatLng(-6.923668, 107.605011);
    
            let mapOptions = {
              center: latLng,
              zoom: 17,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              disableDefaultUI: true
            }
          
            this.map = new google.maps.Map(this.mapElement, mapOptions);
            resolve(true);
    
          /*   var marker = new google.maps.Marker({
              map: this.map,
              animation: google.maps.Animation.DROP,
              position: latLng
          }); */
            let polyOptions = {
             /*  strokeWeight: 2,
              strokeOpacity: 0.8,
              fillOpacity: 0.45, */
              strokeColor: '#000',
              strokeOpacity: 0.8,
              strokeWeight: 6,
              fillColor: 'green',
              fillOpacity: 0.35,
              editable: true,
            };
    
            var drawingManager = new google.maps.drawing.DrawingManager({
              drawingControl: false,
              drawingControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
                drawingModes: [
                  google.maps.drawing.OverlayType.POLYGON,
                ]
              },
              polygonOptions: polyOptions,
              map: this.map
            });
            google.maps.event.addListener(drawingManager, 'overlaycomplete', (e) => {
              this.all_overlays.push(e);
                this.selectedShape=e.overlay
    
                if (e.type != google.maps.drawing.OverlayType.MARKER) {
              // Switch back to non-drawing mode after drawing a shape.
              drawingManager.setDrawingMode(null);
    
              // Add an event listener that selects the newly-drawn shape when the user
              // mouses down on it.
              newShape = e.overlay;
              newShape.type = e.type;
              google.maps.event.addListener(newShape, 'click', ()=> {
                this.setSelection(newShape);
              });
    
               this.setSelection(newShape);
            }
              });
    
              // Create Button
                google.maps.event.addDomListener(document.getElementById('create-button'), 'click', () => {
                  if(!this.pathstr){
                  drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
                }else {
                  this.presentToast('Hapus polygon terlebih dahulu');
                }
                });
                 google.maps.event.addDomListener(document.getElementById('create-plan'), 'click', () => {
                  if(this.pathstr != null){
                    this.setSelection(newShape);
                    this.navCtrl.push(Plan2Page,{
                      latlng : this.pathstr,
                      area : this.area.toFixed(2),
                    });
                  }else{
                      this.presentToast('Anda harus membuat polygon dahulu');
                    }
                  
    
                }); 
               google.maps.event.addListener(this.map, 'click', () => { this.clearSelection(newShape); }); 
               google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', () => { 
                this.deleteAllShape();
               });
        }); 
   
    


    });  


  }

  

  disableMap(): void {

    if (this.pleaseConnect) {
      this.pleaseConnect.style.display = "block";
    }

  }

  enableMap(): void {

    if (this.pleaseConnect) {
      this.pleaseConnect.style.display = "none";
    }

  }

  addConnectivityListeners(): void {

    this.connectivityService.watchOnline().subscribe(() => {

      setTimeout(() => {

        if (typeof google == "undefined" || typeof google.maps == "undefined") {
          this.loadGoogleMaps();
        }
        else {
          if (!this.mapInitialised) {
            this.initMap();
          }

          this.enableMap();
        }

      }, 2000);

    });

    this.connectivityService.watchOffline().subscribe(() => {

      this.disableMap();

    });

  }


}
