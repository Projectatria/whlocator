import { Component, ViewChild } from '@angular/core';
import { AlertController, ViewController, IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HttpHeaders } from "@angular/common/http";
import { ApiProvider } from '../../providers/api/api';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-receivingdetailview',
  templateUrl: 'receivingdetailview.html',
})
export class ReceivingdetailviewPage {
  private detailno = '';
  private orderno = '';
  private itemno = '';
  private qty = '';
  private staging = '';
  private description = '';
  private uuidrcv = '';
  private locationcode = '';
  private photos = [];
  private totalphoto: any;
  private token:any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private transfer: FileTransfer,
    private camera: Camera,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    private alertCtrl: AlertController,
    public api: ApiProvider,
    public fb: FormBuilder,
    public http: HttpClient,
    public storage: Storage
  ) 
  { 
    this.detailno = navParams.get('detailno');
    this.orderno = navParams.get('orderno');
    this.itemno = navParams.get('itemno');
    this.qty = navParams.get('qty');
    this.staging = navParams.get('staging');
    this.description = navParams.get('description');
    this.locationcode = navParams.get('locationcode');
    this.uuidrcv = navParams.get('uuid');
    this.getPhotos();
  }
  ionViewCanEnter() {
    this.storage.get('token').then((val) => {
      console.log(val);
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
    console.log(this.uuidrcv, this.detailno, this.orderno, this.locationcode);
  }
  getPhotos() {
    this.api.get("table/link_image",{ params: { filter: 'parent=' + "'" + this.uuidrcv + "'" } }).subscribe(val => {
      this.photos = val['data'];
      this.totalphoto = val['count'];
    })
  }
  close() {
    this.viewCtrl.dismiss();
  }
}
