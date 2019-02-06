import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { Button } from 'ionic-angular/components/button/button';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-location',
  templateUrl: 'location.html',
})
export class LocationPage {
  private location_master = [];
  private location_room = [];
  private location_codearea = [];
  private location_area = [];
  private location_rack = [];
  public toggled: boolean = false;
  private token:any;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public api: ApiProvider, 
    private viewCtrl : ViewController,
    public storage: Storage) {
  this.getLocationMaster();
  this.getLocationRoom();
  this.getLocationCodeArea();
  this.getLocationArea();
  this.getLocationRack();
  this.toggled = false;
  }
  ionViewCanEnter() {
    this.storage.get('token').then((val) => {
      this.token = val;
      if (this.token != null) {
        return true;
      }
      else {
        return false;
      }
    });
  }
  ionViewDidLoad() {

  }
  getLocationRoom() {
    this.api.get('table/location_room',{params:{limit:100}}).subscribe(val => {
      this.location_room = val['data'];
    });
  }
  getLocationCodeArea() {
    this.api.get('table/location_codearea',{params:{limit:100}}).subscribe(val => {
      this.location_codearea = val['data'];
    });
  }
  getLocationArea() {
    this.api.get('table/location_area',{params:{limit:100}}).subscribe(val => {
      this.location_area = val['data'];
    });
  }
  getLocationRack() {
    this.api.get('table/location_rack',{params:{limit:100}}).subscribe(val => {
      this.location_rack = val['data'];
    });
  }
  getLocationMaster() {
    this.api.get('table/location_master',{params:{limit:100}}).subscribe(val => {
      this.location_master = val['data'];
    });
  }
  closeLocation() {
    this.viewCtrl.dismiss();
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }

  
}
