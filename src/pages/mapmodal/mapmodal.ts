import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ViewController } from 'ionic-angular';
import { ApiProvider } from "../../providers/api/api";

declare var google;

@IonicPage()
@Component({
  selector: 'page-mapmodal',
  templateUrl: 'mapmodal.html',
})
export class MapmodalPage {

  public zone;
  public address = '';
  public latitude = '';
  public longitude = '';
  public marker;
  public map: any;
  public infowindow = new google.maps.InfoWindow();
  public myLatlng = new google.maps.LatLng(-6.1540379, 106.732504);
  public geocoder = new google.maps.Geocoder();
  public myMarker;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public event: Events,
    public api: ApiProvider,
    public viewCtrl: ViewController
  ) {
    this.zone = new NgZone({ enableLongStackTrace: false })
  }
  closeMapModal() {
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    this.event.subscribe('data-changed', this.updateData.bind(this))
    this.getGeocode();
  }
  getGeocode() {
    this.map = new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      center: this.myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    })
    let that = this
    that.marker = new google.maps.Marker({
      map: this.map,
      position: this.myLatlng,
      draggable: true
    });
    that.geocoder.geocode({ 'latLng': this.myLatlng }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          that.zone.run(() => {
            that.address = results[0].formatted_address;
          })
          that.event.publish('data-changed');
        }
      }
    });

    google.maps.event.addListener(this.marker, 'dragend', function () {
      that.geocoder.geocode({ 'latLng': that.marker.getPosition() }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            that.zone.run(() => {
              that.address = results[0].formatted_address;
            })
            that.event.publish('data-changed');
          }
        }
      });
    });
  }
  updateData() {
    console.log(this.address)
    this.latitude = this.marker.getPosition().lat();
    this.longitude = this.marker.getPosition().lng();
  }
  pickLocation(address, latitude, longitude) {
    console.log(address, latitude, longitude);
    this.navCtrl.push('DeliveryaddPage', {
      param: address, latitude, longitude
    });
    this.viewCtrl.dismiss();
  }
}
