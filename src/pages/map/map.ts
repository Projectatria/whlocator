import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { ApiProvider } from "../../providers/api/api";

declare var google;

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

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

  constructor(public navCtrl: NavController, public navParams: NavParams, public event: Events, public api: ApiProvider) {
    this.zone = new NgZone({ enableLongStackTrace: false })
  }

  ionViewDidLoad() {
    this.event.subscribe('data-changed', this.updateData.bind(this))
    this.initialize();
    this.updateMyLocation();
  }

  initialize() {
    this.map = new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      center: this.myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    })
    this.myMarker = new google.maps.Marker({
      map: this.map,
      position: this.myLatlng
    });
    //this.infowindow.setPosition(this.myLatlng);
    //this.infowindow.setContent('Anda berada disini');
    //this.infowindow.setMap(this.map);

    this.getMyLocation();
    this.getGeocode();
    this.getDistance();
    //this.searchLocation();

  }

  getMyLocation() {
    let that = this;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        //that.infowindow.setPosition(pos);
        //that.infowindow.setContent('Anda berada disini');
        //that.infowindow.setMap(that.map);
        that.map.setCenter(pos);

      });
    }
  }
  updateMyLocation() {
    let that = this;
    if (navigator.geolocation) {
      let options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      };
      navigator.geolocation.watchPosition(function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        that.map.setCenter(pos);
        //that.infowindow.setPosition(pos);
        that.myMarker.setPosition(pos);

      },
        function (err) { },
        options);
    }
  }
  getGeocode() {
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
          //  that.infowindow.setContent(results[0].formatted_address);
          //  that.infowindow.open(that.map, that.marker);
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
            //that.infowindow.setContent(results[0].formatted_address);
            //that.infowindow.open(that.map, that.marker);
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

  getDistance() {
    let bounds = new google.maps.LatLngBounds;
    let service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
      origin: this.myLatlng,
      destination: this.myMarker,
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }, function (response, status) {
      if (status !== 'OK') {
        alert('Error was: ' + status);
      } else {
        var originList = response.originAddresses;
        var destinationList = response.destinationAddresses;
        var outputDiv = document.getElementById('output');
        outputDiv.innerHTML = '';
        //deleteMarkers(markersArray);

        var showGeocodedAddressOnMap = function (asDestination) {
          //var icon = asDestination ? destinationIcon : originIcon;
          return function (results, status) {
            if (status === 'OK') {
              this.map.fitBounds(bounds.extend(results[0].geometry.location));
              this.myMarker.push(new google.maps.Marker({
                map: this.map,
                position: results[0].geometry.location,
                //icon: icon
              }));
            } else {
              alert('Geocode was not successful due to: ' + status);
            }
          };
        };

        for (var i = 0; i < originList.length; i++) {
          var results = response.rows[i].elements;
          this.geocoder.geocode({ 'address': originList[i] },
            showGeocodedAddressOnMap(false));
          for (var j = 0; j < results.length; j++) {
            this.geocoder.geocode({ 'address': destinationList[j] },
              showGeocodedAddressOnMap(true));
            outputDiv.innerHTML += originList[i] + ' to ' + destinationList[j] +
              ': ' + results[j].distance.text + ' in ' +
              results[j].duration.text + '<br>';
          }
        }
      }
    });
  }
  deleteMarkers(markersArray) {
    for (var i = 0; i < markersArray.length; i++) {
      markersArray[i].setMap(null);
    }
    markersArray = [];
  }

  calculateAndDisplayRoute() {
    let that = this;
    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;

    directionsService.route({
      origin: that.myLatlng,
      destination: new google.maps.LatLng(that.latitude, that.longitude),
      travelMode: 'DRIVING'
    }, function (response, status) {
      if (status === 'OK') {
        console.log('result', response)
        directionsDisplay.setDirections(response);
        directionsDisplay.setMap(that.map);
        //that.map.setCenter({ lat: -6.2069217, lng: 106.6604188 })
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  searchLocation() {
    let input = document.getElementById('pac-input');
    let searchBox = new google.maps.places.SearchBox(input);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    this.map.addListener('bounds_changed', function () {
      searchBox.setBounds(this.map.getBounds());
    });

    let markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
      let places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach(function (marker) {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      let bounds = new google.maps.LatLngBounds();
      places.forEach(function (place) {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        let icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        markers.push(new google.maps.Marker({
          map: this.map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        }));

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      this.map.fitBounds(bounds);
    });
  }
  pickLocation(){
    
  }
}