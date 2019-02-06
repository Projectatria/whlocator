import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

declare var google;

@IonicPage()
@Component({
  selector: 'page-searchbox',
  templateUrl: 'searchbox.html',
})
export class SearchboxPage {

  public map: any;
  public markers = [];
  public bounds = new google.maps.LatLngBounds();
  public icon;
  public search = new google.maps.places.SearchBox();


  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchboxPage');
    this.initAutocomplete();
  }

  initAutocomplete() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -33.8688, lng: 151.2195},
      zoom: 13,
      mapTypeId: 'roadmap'
    });
    let input = document.getElementById('pac-input');
    this.search = new google.maps.places.SearchBox(input);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    this.map.addListener('bounds_changed', function() {
      this.search.setBounds(this.map.getBounds());
    });

    this.search.addListener('places_changed', function() {
      var places = this.search.getPlaces();

      if (places.length == 0) {
        return;
      }
      this.markers.forEach(function(marker) {
        marker.setMap(null);
      });

      places.forEach(function(place) {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        this.icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        this.markers.push(new google.maps.Marker({
          map: this.map,
          icon: this.icon,
          title: place.name,
          position: place.geometry.location
        }));

        if (place.geometry.viewport) {
          this.bounds.union(place.geometry.viewport);
        } else {
          this.bounds.extend(place.geometry.location);
        }
      });
      this.map.fitBounds(this.bounds);
    });
  }

}
