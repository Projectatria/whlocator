import { Component } from '@angular/core';
import { ModalController, MenuController, IonicPage, LoadingController, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormBuilder } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";;
import { Storage } from '@ionic/storage';
import { ImageViewerController } from 'ionic-img-viewer';

declare var cordova;
declare var window;
declare var Honeywell;

@IonicPage()
@Component({
  selector: 'page-qcin',
  templateUrl: 'qcin.html',
})
export class QcinPage {
  public loader: any;
  private staging_in = [];
  private quality_control = [];
  private qcresult = [];
  private qcresultclsd = [];
  private qcresultopen = [];
  private qcinpic = [];
  private qcinbarcode = [];
  private photos = [];
  searchstaging: any;
  searchqc: any;
  halaman = 0;
  totaldata: any;
  totaldataqc: any;
  totaldataqcresult: any;
  totaldataqcresultclsd: any;
  totaldataqcresultopen: any;
  totalphoto: any;
  public toggled: boolean = false;
  qc: string = "qcin";
  private nextnoqc = '';
  private nextnoqcresult = '';
  public detailqc: boolean = false;
  public detailqcclsd: boolean = false;
  public button: boolean = false;
  private qclist = '';
  public qclistclsd = '';
  private batchnolist = '';
  public batchnolistclsd = '';
  option: BarcodeScannerOptions;
  imageURI: string = '';
  imageFileName: string = '';
  private uuid = '';
  private uuidqcresult = '';
  private qcno = '';
  private qcnoresult = '';
  private viewfoto = '';
  private qcqty = '';
  private qcqtyclsd = '';
  private token: any;
  public name: any;
  public userid: any;
  public role = [];
  public roleid: any;
  public rolecab: any;
  public quality_control_clsd = [];
  public quality_control_rejected = [];
  public itemno: any;
  public qcstatus: any;


  constructor(
    public navCtrl: NavController,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public menu: MenuController,
    public modalCtrl: ModalController,
    private transfer: FileTransfer,
    private barcodeScanner: BarcodeScanner,
    private camera: Camera,
    public loadingCtrl: LoadingController,
    public storage: Storage
  ) {
    this.getStagingin();
    this.toggled = false;
    this.qc = "qcin"
    this.detailqc = false;
    this.detailqcclsd = false;
    this.button = false;
    this.storage.get('name').then((val) => {
      this.name = val;
    });
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          this.roleid = this.role[0].id_group
          this.rolecab = this.role[0].id_cab
          console.log(this.roleid)
          this.api.get('table/qc_in', { params: { limit: 10, filter: "status='OPEN' AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
            .subscribe(val => {
              this.quality_control = val['data']
              this.searchqc = this.quality_control
            });
          this.api.get('table/qc_in', { params: { limit: 10, filter: "status='CLSD'  AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
            .subscribe(val => {
              this.quality_control_clsd = val['data']
            });
        })
    });
    this.api.get('table/qc_in', { params: { limit: 10, filter: "status='OPEN' AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
      .subscribe(val => {
        this.quality_control = val['data'];
        this.totaldataqc = val['count'];
        this.searchqc = this.quality_control;
      });
  }
  doProfile() {
    this.navCtrl.push('UseraccountPage');
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
  getStagingin() {
    return new Promise(resolve => {
      let offsetstagingin = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/staging_in', { params: { limit: 30, offset: offsetstagingin, filter: "qty_qc!=0" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.staging_in.push(data[i]);
              this.totaldata = val['count'];
              this.searchstaging = this.staging_in;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    })

  }
  getStagingqc() {
    return new Promise(resolve => {
      let offsetqc = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/qc_in', { params: { limit: 30, offset: offsetqc, filter: "status='OPEN' AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.quality_control.push(data[i]);
              this.totaldataqc = val['count'];
              this.searchqc = this.quality_control;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchStagingDetail(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.staging_in = this.searchstaging.filter(qc => {
        return qc.order_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.staging_in = this.searchstaging;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  doInfiniteStaging(infiniteScroll) {
    this.getStagingin().then(response => {
      infiniteScroll.complete();

    })
  }
  doInfiniteQC(infiniteScroll) {
    this.getStagingqc().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }
  doRefreshStaging(refresher) {
    this.api.get('table/staging_in', { params: { limit: 30, filter: "qty_qc!=0" } })
      .subscribe(val => {
        this.staging_in = val['data'];
        this.totaldata = val['count'];
        this.searchstaging = this.staging_in;
        refresher.complete();
      });
  }
  doRefreshmyqc(refresher) {
    this.api.get('table/qc_in', { params: { limit: 30, filter: "status='OPEN' AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
      .subscribe(val => {
        this.quality_control = val['data'];
        this.totaldataqc = val['count'];
        this.searchqc = this.quality_control;
        refresher.complete();
      });
  }
  ionViewDidLoad() {
  }
  viewDetail(myqc) {
    this.navCtrl.push('QcindetailPage', {
      qcno: myqc.qc_no,
      receivingno: myqc.receiving_no,
      orderno: myqc.order_no,
      batchno: myqc.batch_no,
      itemno: myqc.item_no,
      pic: myqc.pic,
      qty: myqc.qty,
      staging: myqc.staging
    });
  }
  doInsertQCResult(data, staging, nextnoqc) {
    this.getNextNoQCResult().subscribe(val => {
      let time = moment().format('HH:mm:ss');
      let date = moment().format('YYYY-MM-DD');
      let uuid = UUID.UUID();
      let nextnoqcresult = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      this.api.post("table/qc_in_result",
        {
          "qc_result_no": nextnoqcresult,
          "qc_no": nextnoqc,
          "batch_no": staging.batch_no,
          "item_no": staging.item_no,
          "qc_pic": this.userid,
          "qty_receiving": staging.qty,
          "unit": staging.unit,
          "qc_status": "OPEN",
          "qc_description": "",
          "uuid": uuid
        },
        { headers })
        .subscribe(val => {

        }, err => {
          this.doInsertQCResult(data, staging, nextnoqc)
        })
    }, err => {
      this.doInsertQCResult(data, staging, nextnoqc)
    });
  }
  doLoopQcOutResult(data, staging, nextnoqc) {
    for (let i = 0; i < data.qty; i++) {
      this.doInsertQCResult(data, staging, nextnoqc)
    }

  }
  doOpenQty(staging) {
    let alert = this.alertCtrl.create({
      title: staging.item_no,
      inputs: [
        {
          name: 'qty',
          placeholder: 'Qty'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'OK',
          handler: data => {
            if (data.qty > 0) {
              this.api.get('table/staging_in', { params: { limit: 30, filter: "staging_no=" + "'" + staging.staging_no + "'" } })
                .subscribe(val => {
                  let datastaging = val['data']
                  if (datastaging[0].qty_qc < data.qty) {
                    let alert = this.alertCtrl.create({
                      title: 'Error',
                      subTitle: 'Qty lebih besar dari stok',
                      buttons: ['OK']
                    });
                    alert.present();
                    this.halaman = 0;
                    this.staging_in = [];
                    this.getStagingin()
                  }
                  else {
                    this.api.get('table/qc_in', { params: { limit: 30, filter: "(pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" + " AND " + "batch_no=" + "'" + datastaging[0].batch_no + "'" + " AND " + "item_no=" + "'" + datastaging[0].item_no + "'" } })
                      .subscribe(val => {
                        this.qcinpic = val['data'];
                        if (this.qcinpic.length == 0) {
                          this.api.get('nextno/qc_in/qc_no')
                            .subscribe(val => {
                              this.nextnoqc = val['nextno'];
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              let date = moment().format('YYYY-MM-DD');
                              this.api.post("table/qc_in",
                                {
                                  "qc_no": this.nextnoqc,
                                  "receiving_no": datastaging[0].receiving_no,
                                  "doc_no": datastaging[0].doc_no,
                                  "order_no": datastaging[0].order_no,
                                  "batch_no": datastaging[0].batch_no,
                                  "item_no": datastaging[0].item_no,
                                  "date_start": moment().format('YYYY-MM-DD'),
                                  "time_start": moment().format('HH:mm:ss'),
                                  "pic": this.userid,
                                  "qty": data.qty,
                                  "unit": datastaging[0].unit,
                                  "staging": datastaging[0].staging,
                                  "status": 'OPEN',
                                  "uuid": UUID.UUID()
                                },
                                { headers })
                                .subscribe(val => {
                                  let nextnoqc = this.nextnoqc
                                  this.doLoopQcOutResult(data, staging, nextnoqc)
                                  const headers = new HttpHeaders()
                                    .set("Content-Type", "application/json");
                                  this.api.put("table/staging_in",
                                    {
                                      "staging_no": datastaging[0].staging_no,
                                      "qty_qc": datastaging[0].qty_qc - data.qty
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      this.api.get('table/staging_in', { params: { filter: "qty_qc!=0" } })
                                        .subscribe(val => {
                                          this.staging_in = val['data'];
                                          this.totaldata = val['count'];
                                          this.searchstaging = this.staging_in;
                                          this.api.get('table/qc_in', { params: { limit: 30, filter: "status='OPEN' AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                            .subscribe(val => {
                                              this.quality_control = val['data'];
                                              this.totaldataqc = val['count'];
                                              this.searchqc = this.quality_control;
                                            });
                                        });

                                    });
                                }, err => {
                                  let nextnoqc = this.nextnoqc
                                  this.doLoopQcOutResult(data, staging, nextnoqc)
                                  const headers = new HttpHeaders()
                                    .set("Content-Type", "application/json");
                                  this.api.put("table/staging_in",
                                    {
                                      "staging_no": datastaging[0].staging_no,
                                      "qty_qc": datastaging[0].qty_qc - data.qty
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      this.api.get('table/staging_in', { params: { filter: "qty_qc!=0" } })
                                        .subscribe(val => {
                                          this.staging_in = val['data'];
                                          this.totaldata = val['count'];
                                          this.searchstaging = this.staging_in;
                                          this.api.get('table/qc_in', { params: { limit: 30, filter: "status='OPEN' AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                            .subscribe(val => {
                                              this.quality_control = val['data'];
                                              this.totaldataqc = val['count'];
                                              this.searchqc = this.quality_control;
                                            });
                                        });

                                    });
                                });
                            });
                        }
                        else {
                          const headers = new HttpHeaders()
                            .set("Content-Type", "application/json");
                          let date = moment().format('YYYY-MM-DD');
                          this.api.put("table/qc_in",
                            {
                              "qc_no": this.qcinpic[0].qc_no,
                              "qty": parseInt(this.qcinpic[0].qty) + parseInt(data.qty)
                            },
                            { headers })
                            .subscribe(val => {
                              let nextnoqc = this.qcinpic[0].qc_no
                              this.doLoopQcOutResult(data, staging, nextnoqc)
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              this.api.put("table/staging_in",
                                {
                                  "staging_no": datastaging[0].staging_no,
                                  "qty_qc": datastaging[0].qty_qc - data.qty
                                },
                                { headers })
                                .subscribe(val => {
                                  this.api.get('table/staging_in', { params: { filter: "qty_qc!=0" } })
                                    .subscribe(val => {
                                      this.staging_in = val['data'];
                                      this.totaldata = val['count'];
                                      this.searchstaging = this.staging_in;
                                      this.api.get('table/qc_in', { params: { limit: 30, filter: "(pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                        .subscribe(val => {
                                          this.quality_control = val['data'];
                                          this.totaldataqc = val['count'];
                                          this.searchqc = this.quality_control;
                                        });
                                    });

                                });
                            }, err => {
                              let nextnoqc = this.qcinpic[0].qc_no
                              this.doLoopQcOutResult(data, staging, nextnoqc)
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              this.api.put("table/staging_in",
                                {
                                  "staging_no": datastaging[0].staging_no,
                                  "qty_qc": datastaging[0].qty_qc - data.qty
                                },
                                { headers })
                                .subscribe(val => {
                                  this.api.get('table/staging_in', { params: { filter: "qty_qc!=0" } })
                                    .subscribe(val => {
                                      this.staging_in = val['data'];
                                      this.totaldata = val['count'];
                                      this.searchstaging = this.staging_in;
                                      this.api.get('table/qc_in', { params: { limit: 30, filter: "(pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                        .subscribe(val => {
                                          this.quality_control = val['data'];
                                          this.totaldataqc = val['count'];
                                          this.searchqc = this.quality_control;
                                        });
                                    });

                                });
                            });
                        }
                      });
                  }
                });
            }
            else {
              let alert = this.alertCtrl.create({
                title: 'Perhatian',
                subTitle: 'Qty Tidak Boleh Kosong !!',
                buttons: ['OK']
              });
              alert.present();
            }
          }
        }
      ]
    });
    alert.present();
  }
  doDetailQC(myqc) {
    this.qcresult = [];
    this.qclist = myqc.item_no;
    this.batchnolist = myqc.batch_no;
    this.qcqty = myqc.qty
    this.detailqc = this.detailqc ? false : true;
    this.getQCResult(myqc);
  }
  doDetailQCclsd(myqc) {
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading...'
    });
    this.loader.present()
    this.qclistclsd = myqc.item_no;
    this.batchnolistclsd = myqc.batch_no;
    this.qcqtyclsd = myqc.qty
    this.detailqcclsd = this.detailqcclsd ? false : true;
    this.getQCResultclsd(myqc);
  }
  getQCResult(myqc) {
    return new Promise(resolve => {
      this.api.get("table/qc_in_result", { params: { limit: 1000, filter: 'qc_no=' + "'" + myqc.qc_no + "'" } }).subscribe(val => {
        this.qcresult = val['data'];
        this.totaldataqcresult = val['count'];
        resolve();
      })
    });
  }
  getQCResultclsd(myqc) {
    this.api.get("table/qc_in_result", { params: { limit: 1000, filter: 'qc_no=' + "'" + myqc.qc_no + "'" } }).subscribe(val => {
      this.qcresultclsd = val['data'];
      console.log(this.qcresultclsd)
      this.totaldataqcresultclsd = val['count'];
      this.loader.dismiss()
    });
  }
  doChecked() {
    var self = this
    Honeywell.barcodeReaderPressSoftwareTrigger(function () {
      Honeywell.onBarcodeEvent(function (data) {
        var barcodeno = data.barcodeData;
        var batchno = barcodeno.substring(0, 4);
        var itemno = barcodeno.substring(4, 20);;
        self.api.get('table/qc_in', { params: { limit: 30, filter: "(pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" + " AND " + "batch_no=" + "'" + batchno + "'" + " AND " + "item_no=" + "'" + itemno + "'" + " AND " + "status='OPEN'" } })
          .subscribe(val => {
            self.qcinbarcode = val['data'];
            if (self.qcinbarcode.length == 0) {
              let alert = self.alertCtrl.create({
                title: 'Error',
                subTitle: 'Data Not Found In My QC',
                buttons: ['OK']
              });
              alert.present();
            }
            else {
              self.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + self.qcinbarcode[0].qc_no + "'" } }).subscribe(val => {
                self.qcresult = val['data'];
                self.totaldataqcresult = val['count'];
                if (self.qcinbarcode.length == 0) {
                  let alert = self.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Data Not Found In My QC',
                    buttons: ['OK']
                  });
                  alert.present();
                }
                else if (self.totaldataqcresult == self.qcinbarcode[0].qty) {
                  let alert = self.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Data Already Create',
                    buttons: ['OK']
                  });
                  alert.present();
                }
                else {
                  let alert = self.alertCtrl.create({
                    title: 'Confirm Start',
                    message: 'Do you want to QC Now?',
                    buttons: [
                      {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                        }
                      },
                      {
                        text: 'Start',
                        handler: () => {
                          self.getNextNoQCResult().subscribe(val => {
                            let time = moment().format('HH:mm:ss');
                            let date = moment().format('YYYY-MM-DD');
                            let uuid = UUID.UUID();
                            self.nextnoqcresult = val['nextno'];
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            self.api.post("table/qc_in_result",
                              {
                                "qc_result_no": self.nextnoqcresult,
                                "qc_no": self.qcinbarcode[0].qc_no,
                                "batch_no": self.qcinbarcode[0].batch_no,
                                "item_no": self.qcinbarcode[0].item_no,
                                "date_start": date,
                                "date_finish": date,
                                "time_start": time,
                                "time_finish": time,
                                "qc_pic": this.userid,
                                "qty_receiving": self.qcinbarcode[0].qty,
                                "unit": self.qcinbarcode[0].unit,
                                "qc_status": "OPEN",
                                "qc_description": "",
                                "uuid": uuid
                              },
                              { headers })
                              .subscribe(val => {
                                document.getElementById("myQCChecking").style.display = "block";
                                document.getElementById("myBTNChecking").style.display = "block";
                                document.getElementById("myHeader").style.display = "none";
                                self.button = true;
                                self.uuidqcresult = uuid;
                                self.qcnoresult = self.nextnoqcresult;
                                self.qcno = self.qcinbarcode[0].qc_no
                                self.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + self.uuidqcresult + "'" } }).subscribe(val => {
                                  self.photos = val['data'];
                                  self.totalphoto = val['count'];
                                });
                              })
                          });
                        }
                      }
                    ]
                  });
                  alert.present();
                }
              });
            }

          });
      }, function (reason) {
        alert(reason + '1');
      });
    }, function (reason) {
      self.barcodeScanner.scan().then(barcodeData => {
        var barcodeno = barcodeData.text;
        var batchno = barcodeno.substring(0, 4);
        var itemno = barcodeno.substring(4, 20);;
        self.api.get('table/qc_in', { params: { limit: 30, filter: "(pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" + " AND " + "batch_no=" + "'" + batchno + "'" + " AND " + "item_no=" + "'" + itemno + "'" + " AND " + "status='OPEN'" } })
          .subscribe(val => {
            self.qcinbarcode = val['data'];
            if (self.qcinbarcode.length == 0) {
              let alert = self.alertCtrl.create({
                title: 'Error',
                subTitle: 'Data Not Found In My QC',
                buttons: ['OK']
              });
              alert.present();
            }
            else {
              self.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + self.qcinbarcode[0].qc_no + "'" } }).subscribe(val => {
                self.qcresult = val['data'];
                self.totaldataqcresult = val['count'];
                if (self.qcinbarcode.length == 0) {
                  let alert = self.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Data Not Found In My QC',
                    buttons: ['OK']
                  });
                  alert.present();
                }
                else if (self.totaldataqcresult == self.qcinbarcode[0].qty) {
                  let alert = self.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Data Already Create',
                    buttons: ['OK']
                  });
                  alert.present();
                }
                else {
                  let alert = self.alertCtrl.create({
                    title: 'Confirm Start',
                    message: 'Do you want to QC Now?',
                    buttons: [
                      {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                        }
                      },
                      {
                        text: 'Start',
                        handler: () => {
                          self.getNextNoQCResult().subscribe(val => {
                            let time = moment().format('HH:mm:ss');
                            let date = moment().format('YYYY-MM-DD');
                            let uuid = UUID.UUID();
                            self.nextnoqcresult = val['nextno'];
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            self.api.post("table/qc_in_result",
                              {
                                "qc_result_no": self.nextnoqcresult,
                                "qc_no": self.qcinbarcode[0].qc_no,
                                "batch_no": self.qcinbarcode[0].batch_no,
                                "item_no": self.qcinbarcode[0].item_no,
                                "date_start": date,
                                "date_finish": date,
                                "time_start": time,
                                "time_finish": time,
                                "qc_pic": this.userid,
                                "qty_receiving": self.qcinbarcode[0].qty,
                                "unit": self.qcinbarcode[0].unit,
                                "qc_status": "OPEN",
                                "qc_description": "",
                                "uuid": uuid
                              },
                              { headers })
                              .subscribe(val => {
                                document.getElementById("myQCChecking").style.display = "block";
                                document.getElementById("myBTNChecking").style.display = "block";
                                document.getElementById("myHeader").style.display = "none";
                                self.button = true;
                                self.uuidqcresult = uuid;
                                self.qcnoresult = self.nextnoqcresult;
                                self.qcno = self.qcinbarcode[0].qc_no
                                self.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + self.uuidqcresult + "'" } }).subscribe(val => {
                                  self.photos = val['data'];
                                  self.totalphoto = val['count'];
                                });
                              })
                          });
                        }
                      }
                    ]
                  });
                  alert.present();
                }
              });
            }

          });
      }).catch(err => {
        console.log('Error', err);
      });
    }, {
        press: true
      });
  }
  doHapus(foto) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Yakin ingin menghapus foto ini?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Hapus',
          handler: () => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");

            this.api.put("table/link_image",
              {
                "no": foto.no,
                "img_src": '',
                "file_name": '',
              },
              { headers })
              .subscribe(
                (val) => {
                  this.presentToast("Image deleted successfully");
                  this.photos = [];
                  this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + this.uuidqcresult + "'", sort: "param" + " ASC " } }).subscribe(val => {
                    this.photos = val['data'];
                    this.totalphoto = val['count'];
                  });
                });
          }
        }
      ]
    });
    alert.present();
  }
  doOffChecking() {
    document.getElementById("myQCChecking").style.display = "none";
    document.getElementById("myBTNChecking").style.display = "none";
    //document.getElementById("button").style.display = "block";
    document.getElementById("myHeader").style.display = "block";
    this.button = false;
  }
  /*getfoto(result) {
    console.log('')
    this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + result.uuid + "'" } }).subscribe(val => {
      this.photos = val['data'];
      this.totalphoto = val['count'];
      this.uuidqcresult = result.uuid;
      this.qcnoresult = result.qc_result_no;
      this.qcno = result.qc_no;
      if (result.qc_status == 'OPEN') {
        document.getElementById("myQCChecking").style.display = "block";
        document.getElementById("myBTNChecking").style.display = "block";
        document.getElementById("button").style.display = "block";
        document.getElementById("myHeader").style.display = "none";
        this.button = true;
      }
      else {
        document.getElementById("myQCChecking").style.display = "block";
        document.getElementById("myBTNChecking").style.display = "none";
        document.getElementById("button").style.display = "none";
        document.getElementById("myHeader").style.display = "none";
      }
    });
  }*/
  doInsertLinkImage(resultuuid, i) {
    let ia = i + 1
    let parami = i + 5
    let ib;
    if (parami < 10) {
      ib = '0' + parami
    }
    else {
      ib = parami
    }
    let datetime = moment().format('YYYY-MM-DD HH:mm:ss');
    const headersa = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/link_image",
      {
        "no": UUID.UUID(),
        "param": '0' + ib,
        "param_desc": 'Lainnya ' + ia,
        "parent": resultuuid,
        "table_name": "Qc_in_result",
        "img_src": '',
        "file_name": '',
        "description": '',
        "latitude": "",
        "longitude": "",
        "location_code": '',
        "upload_date": datetime,
        "upload_by": ""
      },
      { headersa })
      .subscribe(val => {

      }, err => {
        this.doInsertLinkImage(resultuuid, i)
      })
  }
  updateFoto(result) {
    let time = moment().format('HH:mm:ss');
    let date = moment().format('YYYY-MM-DD');
    let uuid = UUID.UUID();
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/qc_in_result",
      {
        "qc_result_no": result.qc_result_no,
        "date_start": date,
        "time_start": time,
      },
      { headers })
      .subscribe(val => {
      }, err => {
        this.updateFoto(result)
      });
  }
  getFoto(result) {
    this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + result.uuid + "'", sort: "param" + " ASC " } })
      .subscribe(val => {
        this.photos = val['data'];
        this.totalphoto = val['count'];
        this.uuidqcresult = result.uuid;
        this.qcnoresult = result.qc_result_no;
        this.qcno = result.qc_no;
        this.itemno = result.item_no;
        this.qcstatus = result.qc_status
        if (result.qc_status != 'PASSED') {
          document.getElementById("myQCChecking").style.display = "block";
          document.getElementById("myBTNChecking").style.display = "block";
          // document.getElementById("button").style.display = "block";
          document.getElementById("myHeader").style.display = "none";
          this.button = true;
        }
        else {
          document.getElementById("myQCChecking").style.display = "block";
          document.getElementById("myBTNChecking").style.display = "none";
          // document.getElementById("button").style.display = "none";
          document.getElementById("myHeader").style.display = "none";
        }
      }, err => {
        this.getFoto(result)
      });
  }
  getfoto(result) {
    if (this.roleid == 'ADMIN') {
      this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + result.uuid + "'", sort: "param" + " ASC " } })
        .subscribe(val => {
          this.photos = val['data'];
          this.totalphoto = val['count'];
          this.uuidqcresult = result.uuid;
          this.qcnoresult = result.qc_result_no;
          this.qcno = result.qc_no;
          this.itemno = result.item_no;
          this.qcstatus = result.qc_status
        });
    }
    else {
      if (result.time_start == '00:00:00') {
        let alert = this.alertCtrl.create({
          title: 'Confirm Start',
          message: 'Do you want to QC Now?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
              }
            },
            {
              text: 'Start',
              handler: () => {
                let loader = this.loadingCtrl.create({
                  // cssClass: 'transparent',
                  content: 'Loading...'
                });
                loader.present()
                let datetime = moment().format('YYYY-MM-DD HH:mm:ss');
                const headersa = new HttpHeaders()
                  .set("Content-Type", "application/json");

                this.api.post("table/link_image",
                  {
                    "no": UUID.UUID(),
                    "param": '001',
                    "param_desc": 'Tampak Kiri',
                    "parent": result.uuid,
                    "table_name": "Qc_in_result",
                    "img_src": '',
                    "file_name": '',
                    "description": '',
                    "latitude": "",
                    "longitude": "",
                    "location_code": '',
                    "upload_date": datetime,
                    "upload_by": ""
                  },
                  { headersa })
                  .subscribe(
                    (val) => {
                      this.api.post("table/link_image",
                        {
                          "no": UUID.UUID(),
                          "param": '002',
                          "param_desc": 'Tampak Kanan',
                          "parent": result.uuid,
                          "table_name": "Qc_in_result",
                          "img_src": '',
                          "file_name": '',
                          "description": '',
                          "latitude": "",
                          "longitude": "",
                          "location_code": '',
                          "upload_date": datetime,
                          "upload_by": ""
                        },
                        { headersa })
                        .subscribe(
                          (val) => {
                            this.api.post("table/link_image",
                              {
                                "no": UUID.UUID(),
                                "param": '003',
                                "param_desc": 'Tampak Atas',
                                "parent": result.uuid,
                                "table_name": "Qc_in_result",
                                "img_src": '',
                                "file_name": '',
                                "description": '',
                                "latitude": "",
                                "longitude": "",
                                "location_code": '',
                                "upload_date": datetime,
                                "upload_by": ""
                              },
                              { headersa })
                              .subscribe(
                                (val) => {
                                  this.api.post("table/link_image",
                                    {
                                      "no": UUID.UUID(),
                                      "param": '004',
                                      "param_desc": 'Tampak Bawah',
                                      "parent": result.uuid,
                                      "table_name": "Qc_in_result",
                                      "img_src": '',
                                      "file_name": '',
                                      "description": '',
                                      "latitude": "",
                                      "longitude": "",
                                      "location_code": '',
                                      "upload_date": datetime,
                                      "upload_by": ""
                                    },
                                    { headersa })
                                    .subscribe(
                                      (val) => {
                                        for (let i = 0; i < 50; i++) {
                                          let resultuuid = result.uuid
                                          this.doInsertLinkImage(resultuuid, i)
                                        }
                                        this.updateFoto(result)
                                        this.getFoto(result)
                                        loader.dismiss();
                                      }, err => {
                                        this.api.post("table/link_image",
                                          {
                                            "no": UUID.UUID(),
                                            "param": '004',
                                            "param_desc": 'Tampak Bawah',
                                            "parent": result.uuid,
                                            "table_name": "Qc_in_result",
                                            "img_src": '',
                                            "file_name": '',
                                            "description": '',
                                            "latitude": "",
                                            "longitude": "",
                                            "location_code": '',
                                            "upload_date": datetime,
                                            "upload_by": ""
                                          },
                                          { headersa })
                                          .subscribe()
                                      });
                                }, err => {
                                  this.api.post("table/link_image",
                                    {
                                      "no": UUID.UUID(),
                                      "param": '003',
                                      "param_desc": 'Tampak Atas',
                                      "parent": result.uuid,
                                      "table_name": "Qc_in_result",
                                      "img_src": '',
                                      "file_name": '',
                                      "description": '',
                                      "latitude": "",
                                      "longitude": "",
                                      "location_code": '',
                                      "upload_date": datetime,
                                      "upload_by": ""
                                    },
                                    { headersa })
                                    .subscribe()
                                });
                          }, err => {
                            this.api.post("table/link_image",
                              {
                                "no": UUID.UUID(),
                                "param": '002',
                                "param_desc": 'Tampak Kanan',
                                "parent": result.uuid,
                                "table_name": "Qc_in_result",
                                "img_src": '',
                                "file_name": '',
                                "description": '',
                                "latitude": "",
                                "longitude": "",
                                "location_code": '',
                                "upload_date": datetime,
                                "upload_by": ""
                              },
                              { headersa })
                              .subscribe()
                          });
                    }, err => {
                      this.api.post("table/link_image",
                        {
                          "no": UUID.UUID(),
                          "param": '001',
                          "param_desc": 'Tampak Kiri',
                          "parent": result.uuid,
                          "table_name": "Qc_in_result",
                          "img_src": '',
                          "file_name": '',
                          "description": '',
                          "latitude": "",
                          "longitude": "",
                          "location_code": '',
                          "upload_date": datetime,
                          "upload_by": ""
                        },
                        { headersa })
                        .subscribe()
                    });
              }
            }
          ]
        });
        alert.present();
      }
      else {
        this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + result.uuid + "'", sort: "param" + " ASC " } })
          .subscribe(val => {
            this.photos = val['data'];
            this.totalphoto = val['count'];
            this.uuidqcresult = result.uuid;
            this.qcnoresult = result.qc_result_no;
            this.qcno = result.qc_no;
            this.itemno = result.item_no;
            this.qcstatus = result.qc_status
            if (result.qc_status == 'OPEN') {
              document.getElementById("myQCChecking").style.display = "block";
              document.getElementById("myBTNChecking").style.display = "block";
              // document.getElementById("button").style.display = "block";
              document.getElementById("myHeader").style.display = "none";
              this.button = true;
            }
            else {
              document.getElementById("myQCChecking").style.display = "block";
              document.getElementById("myBTNChecking").style.display = "none";
              // document.getElementById("button").style.display = "none";
              document.getElementById("myHeader").style.display = "none";
            }
          });
      }
    }
  }
  doViewPhoto(foto) {
    this.viewfoto = foto.img_src
    document.getElementById("foto").style.display = "block";
  }
  doCloseViewPhoto() {
    document.getElementById("foto").style.display = "none";
  }
  doCamera(foto) {
    this.api.get("table/configuration_picture").subscribe(val => {
      let configuration = val['data'];
      console.log(configuration)
      if (this.qcstatus != 'PASSED') {
        let options: CameraOptions = {
          quality: configuration[0].camera_quality,
          destinationType: this.camera.DestinationType.FILE_URI
        }
        options.sourceType = this.camera.PictureSourceType.CAMERA

        this.camera.getPicture(options).then((imageData) => {
          let alert = this.alertCtrl.create({
            title: 'Description',
            inputs: [
              {
                name: 'description',
                placeholder: 'Description'
              }
            ],
            buttons: [
              {
                text: 'SAVE',
                handler: datadesc => {
                  this.imageURI = imageData;
                  this.imageFileName = this.imageURI;
                  if (this.imageURI == '') return;
                  let loader = this.loadingCtrl.create({
                    content: "Uploading..."
                  });
                  loader.present();
                  const fileTransfer: FileTransferObject = this.transfer.create();

                  let uuid = UUID.UUID();
                  this.uuid = uuid;
                  let options: FileUploadOptions = {
                    fileKey: 'fileToUpload',
                    //fileName: this.imageURI.substr(this.imageURI.lastIndexOf('/') + 1),
                    fileName: "QCIN" + "-" + this.itemno + "-" + foto.param + uuid + '.jpeg',
                    chunkedMode: true,
                    mimeType: "image/jpeg",
                    headers: {}
                  }

                  let url = "http://101.255.60.202/qctesting/api/Upload";
                  fileTransfer.upload(this.imageURI, url, options)
                    .then((data) => {
                      loader.dismiss();
                      let date = moment().format('YYYY-MM-DD HH:mm:ss');
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");

                      this.api.put("table/link_image",
                        {
                          "no": foto.no,
                          "img_src": 'http://101.255.60.202/qctesting/img/' + "QCIN" + "-" + this.itemno + "-" + foto.param + uuid,
                          "file_name": "QCIN" + "-" + this.itemno + "-" + foto.param + uuid,
                          "description": datadesc.description,
                          "upload_date": date,
                          "upload_by": ""
                        },
                        { headers })
                        .subscribe(
                          (val) => {
                            this.presentToast("Image uploaded successfully");
                            this.photos = [];
                            this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + this.uuidqcresult + "'", sort: "param" + " ASC " } }).subscribe(val => {
                              this.photos = val['data'];
                              this.totalphoto = val['count'];
                            });
                          });
                      this.imageURI = '';
                      this.imageFileName = '';
                    }, (err) => {
                      loader.dismiss();
                      this.presentToast('Silahkan Coba lagi');
                    });
                }
              }
            ]
          });
          alert.present();
        }, (err) => {
          this.presentToast('This Platform is Not Supported');
        });
      }
      else {
        this.doViewPhoto(foto);
      }
    });
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
    });

    toast.present();
  }
  getNextNoQCResult() {
    return this.api.get('nextno/qc_in_result/qc_result_no')
  }
  /*doPassedQC() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Passed',
      message: 'Do you want to Passed this Item?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Passed',
          handler: () => {
            let alert = this.alertCtrl.create({
              title: 'Description',
              inputs: [
                {
                  name: 'description',
                  placeholder: 'Description'
                }
              ],
              buttons: [
                {
                  text: 'SAVE',
                  handler: data => {
                    this.getNextNoQCResult().subscribe(val => {
                      let time = moment().format('HH:mm:ss');
                      let date = moment().format('YYYY-MM-DD');
                      let uuid = UUID.UUID();
                      this.nextnoqcresult = val['nextno'];
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.put("table/qc_in_result",
                        {
                          "qc_result_no": this.qcnoresult,
                          "date_finish": date,
                          "time_finish": time,
                          "qc_status": "PASSED",
                          "qc_description": data.description
                        },
                        { headers })
                        .subscribe(val => {
                          document.getElementById("myQCChecking").style.display = "none";
                          document.getElementById("myBTNChecking").style.display = "none";
                          document.getElementById("myHeader").style.display = "block";
                          this.button = false;
                          this.qcnoresult = '';
                          this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                            this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" + " AND " + "qc_status='OPEN'" } }).subscribe(val => {
                              this.qcresultopen = val['data'];
                              this.totaldataqcresultopen = val['count'];
                              if ((this.totaldataqcresult == this.qcqty) && this.totaldataqcresultopen == 0) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.put("table/qc_in",
                                  {
                                    "qc_no": this.qcno,
                                    "date_start": this.qcresult[0].date_start,
                                    "date_finish": this.qcresult[0].date_finish,
                                    "time_start": this.qcresult[0].time_start,
                                    "time_finish": this.qcresult[0].time_finish,
                                    "status": 'CLSD'
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.api.get('table/qc_in', { params: { limit: 30, filter: "status='OPEN' AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                      .subscribe(val => {
                                        this.quality_control = val['data'];
                                        this.totaldataqc = val['count'];
                                      });
                                  });
                              }
                            });
                          });
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Save Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                        })
                    });
                  }
                }
              ]
            });
            alert.present();
          }
        }
      ]
    });
    alert.present();
  }
  doRejectQC() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Reject',
      message: 'Do you want to Reject this Item?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Reject',
          handler: () => {
            let alert = this.alertCtrl.create({
              title: 'Description',
              inputs: [
                {
                  name: 'description',
                  placeholder: 'Description'
                }
              ],
              buttons: [
                {
                  text: 'SAVE',
                  handler: data => {
                    this.getNextNoQCResult().subscribe(val => {
                      let time = moment().format('HH:mm:ss');
                      let date = moment().format('YYYY-MM-DD');
                      let uuid = UUID.UUID();
                      this.nextnoqcresult = val['nextno'];
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.put("table/qc_in_result",
                        {
                          "qc_result_no": this.qcnoresult,
                          "date_finish": date,
                          "time_finish": time,
                          "qc_status": "REJECT",
                          "qc_description": data.description
                        },
                        { headers })
                        .subscribe(val => {
                          document.getElementById("myQCChecking").style.display = "none";
                          document.getElementById("myBTNChecking").style.display = "none";
                          document.getElementById("myHeader").style.display = "block";
                          this.button = false;
                          this.qcnoresult = '';
                          this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                          });
                          this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                            this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" + " AND " + "qc_status='OPEN'" } }).subscribe(val => {
                              this.qcresultopen = val['data'];
                              this.totaldataqcresultopen = val['count'];
                              if ((this.totaldataqcresult == this.qcqty) && this.totaldataqcresultopen == 0) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.put("table/qc_in",
                                  {
                                    "qc_no": this.qcno,
                                    "date_start": this.qcresult[0].date_start,
                                    "date_finish": this.qcresult[0].date_finish,
                                    "time_start": this.qcresult[0].time_start,
                                    "time_finish": this.qcresult[0].time_finish,
                                    "status": 'CLSD'
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.api.get('table/qc_in', { params: { limit: 30, filter: "status='OPEN' AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                      .subscribe(val => {
                                        this.quality_control = val['data'];
                                        this.totaldataqc = val['count'];
                                      });
                                  });
                              }
                            });
                          });
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Save Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                        })
                    });
                  }
                }
              ]
            });
            alert.present();
          }
        }
      ]
    });
    alert.present();
  }*/
  doPassedQC() {
    if (this.photos[0].img_src == '' || this.photos[1].img_src == '' || this.photos[2].img_src == '' || this.photos[3].img_src == '') {
      let alert = this.alertCtrl.create({
        title: 'Warning',
        subTitle: 'Foto Tampak Kiri, Tampak Kanan, Tampak Atas dan Tampak Bawah harus terpenuhi',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Confirm Passed',
        message: 'Do you want to Passed this Item?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Passed',
            handler: () => {
              let alert = this.alertCtrl.create({
                title: 'Description',
                inputs: [
                  {
                    name: 'description',
                    placeholder: 'Description'
                  }
                ],
                buttons: [
                  {
                    text: 'SAVE',
                    handler: data => {
                      let time = moment().format('HH:mm:ss');
                      let date = moment().format('YYYY-MM-DD');
                      let uuid = UUID.UUID();
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.put("table/qc_in_result",
                        {
                          "qc_result_no": this.qcnoresult,
                          "date_finish": date,
                          "time_finish": time,
                          "qc_status": "PASSED",
                          "qc_description": data.description
                        },
                        { headers })
                        .subscribe(val => {
                          document.getElementById("myQCChecking").style.display = "none";
                          document.getElementById("myBTNChecking").style.display = "none";
                          document.getElementById("myHeader").style.display = "block";
                          this.button = false;
                          this.qcnoresult = '';
                          this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                            this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "' AND qc_status= 'OPEN'" } })
                              .subscribe(val => {
                                this.qcresultopen = val['data'];
                                if (this.qcresultopen.length == 0) {
                                  const headers = new HttpHeaders()
                                    .set("Content-Type", "application/json");
                                  this.api.put("table/qc_in",
                                    {
                                      "qc_no": this.qcno,
                                      "date_finish": moment().format('YYYY-MM-DD'),
                                      "time_finish": moment().format('HH:mm:ss'),
                                      "status": "CLSD"
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      this.api.get('table/qc_in', { params: { limit: 10, filter: "status='OPEN'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                        .subscribe(val => {
                                          this.quality_control = val['data'];
                                          this.totaldataqc = val['count'];
                                          this.searchqc = this.quality_control
                                        });
                                      this.api.get('table/qc_in', { params: { limit: 10, filter: "status='CLSD'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                        .subscribe(val => {
                                          this.quality_control_clsd = val['data']
                                        });
                                    });
                                }
                                this.api.get('table/qc_in', { params: { limit: 10, filter: "status='OPEN'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                  .subscribe(val => {
                                    this.quality_control = val['data'];
                                    this.totaldataqc = val['count'];
                                    this.searchqc = this.quality_control
                                  });
                                this.api.get('table/qc_in', { params: { limit: 10, filter: "status='CLSD'  AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                  .subscribe(val => {
                                    this.quality_control_clsd = val['data']
                                  });
                              });
                          });
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Save Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                        })
                    }
                  }
                ]
              });
              alert.present();
            }
          }
        ]
      });
      alert.present();
    }
  }
  doRejectQC() {
    if (this.photos[0].img_src == '' || this.photos[1].img_src == '' || this.photos[2].img_src == '' || this.photos[3].img_src == '') {
      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Foto Tampak Kiri, Tampak Kanan, Tampak Atas dan Tampak Bawah harus terpenuhi',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Confirm Reject',
        message: 'Do you want to Reject this Item?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Reject',
            handler: () => {
              let alert = this.alertCtrl.create({
                title: 'Description',
                inputs: [
                  {
                    name: 'description',
                    placeholder: 'Description'
                  }
                ],
                buttons: [
                  {
                    text: 'SAVE',
                    handler: data => {
                      let time = moment().format('HH:mm:ss');
                      let date = moment().format('YYYY-MM-DD');
                      let uuid = UUID.UUID();
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.put("table/qc_in_result",
                        {
                          "qc_result_no": this.qcnoresult,
                          "date_finish": date,
                          "time_finish": time,
                          "qc_status": "REJECT",
                          "qc_description": data.description
                        },
                        { headers })
                        .subscribe(val => {
                          this.api.get("table/qc_in_result", { params: { filter: 'qc_result_no=' + "'" + this.qcnoresult + "'" } }).subscribe(val => {
                            let datareject = val['data'];
                            let uuidreject = UUID.UUID();
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            this.api.post("table/qc_in_result_reject",
                              {
                                "qc_result_no": datareject[0].qc_result_no,
                                "qc_no": datareject[0].qc_no,
                                "batch_no": datareject[0].batch_no,
                                "item_no": datareject[0].item_no,
                                "date_start": datareject[0].date_start,
                                "date_finish": datareject[0].date_finish,
                                "time_start": datareject[0].time_start,
                                "time_finish": datareject[0].time_finish,
                                "qc_pic": datareject[0].qc_pic,
                                "qty_receiving": datareject[0].qty_receiving,
                                "unit": datareject[0].unit,
                                "qc_status": datareject[0].qc_status,
                                "qc_description": datareject[0].qc_description,
                                "uuid": uuidreject
                              },
                              { headers })
                              .subscribe(val => {
                                this.api.get('table/link_image', { params: { limit: 100, filter: "parent=" + "'" + datareject[0].uuid + "'" } })
                                  .subscribe(val => {
                                    let data = val['data'];
                                    for (let i = 0; i < data.length; i++) {
                                      let datai = data[i]
                                      this.doInsertfoto(datai, uuidreject)
                                    }
                                  });
                                document.getElementById("myQCChecking").style.display = "none";
                                document.getElementById("myBTNChecking").style.display = "none";
                                document.getElementById("myHeader").style.display = "block";
                                this.button = false;
                                this.qcnoresult = '';
                                this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                                  this.qcresult = val['data'];
                                  this.totaldataqcresult = val['count'];
                                });
                                this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                                  this.qcresult = val['data'];
                                  this.totaldataqcresult = val['count'];
                                  this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" + " AND " + "qc_status='OPEN'" } }).subscribe(val => {
                                    this.qcresultopen = val['data'];
                                    this.totaldataqcresultopen = val['count'];
                                    if (this.qcresultopen.length == 0) {
                                      const headers = new HttpHeaders()
                                        .set("Content-Type", "application/json");
                                      this.api.put("table/qc_in",
                                        {
                                          "qc_no": this.qcno,
                                          "date_finish": moment().format('YYYY-MM-DD'),
                                          "time_finish": moment().format('HH:mm:ss'),
                                          "status": "CLSD"
                                        },
                                        { headers })
                                        .subscribe(val => {
                                          this.api.get('table/qc_in', { params: { limit: 10, filter: "status='OPEN'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                            .subscribe(val => {
                                              this.quality_control = val['data'];
                                              this.totaldataqc = val['count'];
                                              this.searchqc = this.quality_control
                                            });
                                          this.api.get('table/qc_in', { params: { limit: 10, filter: "status='CLSD'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                            .subscribe(val => {
                                              this.quality_control_clsd = val['data']
                                            });
                                        });
                                    }
                                  });
                                });
                              });
                          });
                          let alert = this.alertCtrl.create({
                            title: 'Sukses',
                            subTitle: 'Save Sukses',
                            buttons: ['OK']
                          });
                          alert.present();
                        })
                    }
                  }
                ]
              });
              alert.present();
            }
          }
        ]
      });
      alert.present();
    }
  }
  doInsertfoto(datai, uuidreject) {
    let uuid = UUID.UUID();
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.post("table/link_image",
      {
        "no": uuid,
        "param": datai.param,
        "param_desc": datai.param_desc,
        "parent": uuidreject,
        "table_name": datai.table_name,
        "img_src": datai.img_src,
        "file_name": datai.file_name,
        "description": datai.description,
        "latitude": datai.latitude,
        "longitude": datai.longitude,
        "location_code": datai.location_code,
        "upload_date": datai.upload_date,
        "upload_by": ""
      },
      { headers })
      .subscribe(
        (val) => {
        }, err => {
          this.doInsertfoto(datai, uuidreject);
        });
  }
  doPrintBA(myqc) {
    this.navCtrl.push('BeritaacaraqcPage', {
      myqc: myqc
    })
  }
}