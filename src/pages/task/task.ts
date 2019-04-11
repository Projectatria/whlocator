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

@IonicPage()
@Component({
  selector: 'page-task',
  templateUrl: 'task.html',
})
export class TaskPage {
  private preparation = [];
  private receiving = [];
  private quality_control = [];
  public quality_control_out = [];
  private qcresult = [];
  private qcresultopen = [];
  public userid: any;
  public role = [];
  public roleid = '';
  public rolearea: any;
  private qclist = '';
  private batchnolist = '';
  private qcqty = '';
  public detailqc: boolean = false;
  public detailqcout: boolean = false;
  public rolecab = '';
  public rolegroup = '';
  public photos = [];
  public totalphoto: any;
  public uuidqcresult = '';
  public qcnoresult = '';
  public qcno = '';
  public itemno = '';
  public qcstatus = '';
  public button: boolean = false;
  public totaldataqc: any;
  public totaldataqcresult: any;
  public totaldataqcresultopen: any;
  public quality_control_clsd = [];
  public quality_control_rejected = [];
  public receiptno: any;
  private viewfoto = '';
  public param: any;
  public parent: any;
  public photosview = [];
  public paramdesc: any;
  public description: any;
  imageURI: string = '';
  imageFileName: string = '';
  private uuid = '';
  public transferorder = [];
  public pickinglist = [];

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
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          this.roleid = this.role[0].id_group
          this.rolecab = this.role[0].id_cab
          this.rolearea = this.role[0].id_area
          this.rolegroup = this.role[0].id_group
          this.api.get('table/purchasing_order', {
            params: {
              limit: 30, filter: "(status='INP2'" + " AND " +
                "((pic=" + "'" + this.userid + "')" +
                " OR " +
                "(pic_lokasi=" + "'" + this.userid + "'" + " AND status_location ='')" +
                " OR " +
                "(pic_barcode=" + "'" + this.userid + "'" + " AND status_barcode ='')))"
            }
          })
            .subscribe(val => {
              this.preparation = val['data'];
            });
          this.api.get('table/purchasing_order', { params: { limit: 30, filter: "status='INPG'" + " AND " + "pic=" + "'" + this.userid + "'" } })
            .subscribe(val => {
              this.receiving = val['data'];
            });
          this.api.get('table/qc_in', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" + " AND " + "status='OPEN'" } })
            .subscribe(val => {
              this.quality_control = val['data'];
            });
          this.api.get('table/qc_out', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" + " AND " + "status='OPEN'" } })
            .subscribe(val => {
              this.quality_control_out = val['data'];
            });
          this.api.get('table/transfer_order', { params: { limit: 30, filter: "(from_location=" + "'" + this.rolecab + "'" + " AND " + "status='INPG') OR (to_location=" + "'" + this.rolecab + "'" + " AND " + "status='OPEN') OR (to_location=" + "'" + this.rolecab + "'" + " AND " + "status='CLS1')" } })
            .subscribe(val => {
              this.transferorder = val['data'];
            });
          this.api.get('table/picking_list', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" + " AND " + "status='INP1'" } })
            .subscribe(val => {
              this.pickinglist = val['data'];
            });
        })
    });
  }
  ionViewDidEnter() {

  }
  getPrepare() {
    this.api.get('table/purchasing_order', {
      params: {
        limit: 30, filter: "(status='INP2'" + " AND " +
          "((pic=" + "'" + this.userid + "')" +
          " OR " +
          "(pic_lokasi=" + "'" + this.userid + "'" + " AND status_location ='')" +
          " OR " +
          "(pic_barcode=" + "'" + this.userid + "'" + " AND status_barcode ='')))"
      }
    })
      .subscribe(val => {
        this.preparation = val['data'];
      });
  }
  viewDetailPrepare(prepare) {
    if (this.userid == prepare.pic) {
      this.navCtrl.push('PurchasingorderPage')
    }
    else {
      this.navCtrl.push('DetailpoactionPage', {
        poid: prepare.po_id,
        orderno: prepare.order_no,
        docno: prepare.doc_no,
        batchno: prepare.batch_no,
        locationcode: prepare.location_code,
        transferdate: prepare.transfer_date,
        status: prepare.status,
        totalpost: prepare.total_item_post,
        pic: prepare.pic,
        piclokasi: prepare.pic_lokasi,
        picbarcode: prepare.pic_barcode,
        rolecab: this.rolecab
      });
    }
  }
  getReceiving() {
    this.api.get('table/purchasing_order', { params: { limit: 30, filter: "status='INPG'" + " AND " + "pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.receiving = val['data'];
      });
  }
  viewDetail(rcv) {
    this.navCtrl.push('ReceivingdetailPage', {
      orderno: rcv.order_no,
      docno: rcv.doc_no,
      batchno: rcv.batch_no,
      locationcode: rcv.location_code,
      expectedreceiptdate: rcv.expected_receipt_date,
      rolecab: this.rolecab
    });
  }
  getQC() {
    this.api.get('table/qc_in', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" + " AND " + "status='OPEN'" } })
      .subscribe(val => {
        this.quality_control = val['data'];
      });
  }
  getQCOut() {
    this.api.get('table/qc_out', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" + " AND " + "status='OPEN'" } })
      .subscribe(val => {
        this.quality_control_out = val['data'];
      });
  }
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
  doOffChecking() {
    document.getElementById("myQCChecking").style.display = "none";
    document.getElementById("myBTNChecking").style.display = "none";
    //document.getElementById("button").style.display = "block";
    document.getElementById("myHeader").style.display = "block";
    this.button = false;
  }
  getQCResult(myqc) {
    return new Promise(resolve => {
      this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + myqc.qc_no + "'" } }).subscribe(val => {
        this.qcresult = val['data'];
        resolve();
      })
    });
  }
  getQCResultOut(myqc) {
    return new Promise(resolve => {
      this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + myqc.qc_no + "'" } }).subscribe(val => {
        this.qcresult = val['data'];
        resolve();
      })
    });
  }
  doDetailQC(myqc) {
    this.qcresult = [];
    this.qclist = myqc.item_no;
    this.batchnolist = myqc.batch_no;
    this.qcqty = myqc.qty
    this.detailqc = this.detailqc ? false : true;
    this.getQCResult(myqc);
  }
  doDetailQCOut(myqc) {
    this.qcresult = [];
    this.qclist = myqc.receipt_no;
    this.detailqcout = this.detailqcout ? false : true;
    this.getQCResultOut(myqc);
  }
  doRefresh(refresher) {
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/purchasing_order', {
        params: {
          limit: 30, filter: "(status='INP2'" + " AND " +
            "((pic=" + "'" + this.userid + "')" +
            " OR " +
            "(pic_lokasi=" + "'" + this.userid + "'" + " AND status_location ='')" +
            " OR " +
            "(pic_barcode=" + "'" + this.userid + "'" + " AND status_barcode ='')))"
        }
      })
        .subscribe(val => {
          this.preparation = val['data'];
        });
      this.api.get('table/purchasing_order', { params: { limit: 30, filter: "status='INPG'" + " AND " + "pic=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.receiving = val['data'];
        });
      this.api.get('table/qc_in', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" + " AND " + "status='OPEN'" } })
        .subscribe(val => {
          this.quality_control = val['data'];
        });
      this.api.get('table/qc_out', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" + " AND " + "status='OPEN'" } })
        .subscribe(val => {
          this.quality_control_out = val['data'];
        });
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          this.roleid = this.role[0].id_group
          this.rolecab = this.role[0].id_cab
          this.rolearea = this.role[0].id_area
        })
      refresher.complete();
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
          });
      }
    }
  }
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
                            this.api.get("table/qc_in_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "' AND qc_status!= 'PASSED'" } }).subscribe(val => {
                              this.qcresultopen = val['data'];
                              if (this.qcresultopen.length == 0) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.put("table/qc_in",
                                  {
                                    "qc_no": this.qcno,
                                    "status": "CLSD"
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.api.get('table/qc_in', { params: { limit: 10, filter: "status='OPEN'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                      .subscribe(val => {
                                        this.quality_control = val['data'];
                                        this.totaldataqc = val['count'];
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
                                          this.api.get('table/qc_in', { params: { limit: 10, filter: "status='OPEN'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                            .subscribe(val => {
                                              this.quality_control = val['data'];
                                              this.totaldataqc = val['count'];
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


  getfotoOut(result) {
    if (this.roleid == 'ADMIN') {
      this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + result.uuid + "'", sort: "param" + " ASC " } })
        .subscribe(val => {
          this.photos = val['data'];
          this.totalphoto = val['count'];
          this.uuidqcresult = result.uuid;
          this.qcnoresult = result.qc_result_no;
          this.qcno = result.qc_no;
          this.receiptno = result.receipt_no;
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
                    "table_name": "Qc_out_result",
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
                          "table_name": "Qc_out_result",
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
                                "table_name": "Qc_out_result",
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
                                      "table_name": "Qc_out_result",
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
                                          this.doInsertLinkImageOut(resultuuid, i)
                                        }
                                        this.updateFotoOut(result)
                                        this.getFotoOut(result)
                                        loader.dismiss();
                                      }, err => {
                                        this.api.post("table/link_image",
                                          {
                                            "no": UUID.UUID(),
                                            "param": '004',
                                            "param_desc": 'Tampak Bawah',
                                            "parent": result.uuid,
                                            "table_name": "Qc_out_result",
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
                                      "table_name": "Qc_out_result",
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
                                "table_name": "Qc_out_result",
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
                          "table_name": "Qc_out_result",
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
            this.receiptno = result.receipt_no;
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
          });
      }
    }
  }
  updateFotoOut(result) {
    let time = moment().format('HH:mm:ss');
    let date = moment().format('YYYY-MM-DD');
    let uuid = UUID.UUID();
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/qc_out_result",
      {
        "qc_result_no": result.qc_result_no,
        "date_start": date,
        "time_start": time,
      },
      { headers })
      .subscribe(val => {
      }, err => {
        this.updateFotoOut(result)
      });
  }
  getFotoOut(result) {
    this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + result.uuid + "'", sort: "param" + " ASC " } })
      .subscribe(val => {
        this.photos = val['data'];
        this.totalphoto = val['count'];
        this.uuidqcresult = result.uuid;
        this.qcnoresult = result.qc_result_no;
        this.qcno = result.qc_no;
        this.receiptno = result.receipt_no;
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
        this.getFotoOut(result)
      });
  }
  doInsertLinkImageOut(resultuuid, i) {
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
        "table_name": "Qc_out_result",
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
  doViewPhoto(foto) {
    this.viewfoto = foto.img_src
    this.param = foto.param
    this.parent = foto.parent
    this.paramdesc = foto.param_desc
    this.description = foto.description
    document.getElementById("foto").style.display = "block";
  }
  doPreviousFoto() {
    let param = parseInt(this.param) - parseInt('01')
    let paramprevious: string = "0" + param
    this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + this.parent + "' AND param=" + "'" + paramprevious + "'" } }).subscribe(val => {
      this.photosview = val['data'];
      this.viewfoto = this.photosview[0].img_src
      this.param = this.photosview[0].param
      this.parent = this.photosview[0].parent
      this.paramdesc = this.photosview[0].param_desc
      this.description = this.photosview[0].description
    });
  }
  doNextFoto() {
    let param = parseInt(this.param) + parseInt('01')
    let parampnext: string = "0" + param
    this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + this.parent + "' AND param=" + "'" + parampnext + "'" } }).subscribe(val => {
      this.photosview = val['data'];
      this.viewfoto = this.photosview[0].img_src
      this.param = this.photosview[0].param
      this.parent = this.photosview[0].parent
      this.paramdesc = this.photosview[0].param_desc
      this.description = this.photosview[0].description
    });
  }
  doCloseViewPhoto() {
    document.getElementById("foto").style.display = "none";
  }
  doViewFoto(foto) {
    this.doViewPhoto(foto);
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
                    fileName: this.receiptno + "-" + this.itemno + "-" + foto.param + uuid + '.jpeg',
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
                          "img_src": 'http://101.255.60.202/qctesting/img/' + this.receiptno + "-" + this.itemno + "-" + foto.param + uuid,
                          "file_name": this.receiptno + "-" + this.itemno + "-" + foto.param + uuid,
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
    return this.api.get('nextno/qc_out_result/qc_result_no')
  }
  doPassedQCOut() {
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
                      this.api.put("table/qc_out_result",
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
                          this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                            this.qcresult = val['data'];
                            this.totaldataqcresult = val['count'];
                            this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "' AND qc_status!= 'PASSED'" } }).subscribe(val => {
                              this.qcresultopen = val['data'];
                              if (this.qcresultopen.length == 0) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                this.api.put("table/qc_out",
                                  {
                                    "qc_no": this.qcno,
                                    "status": "CLSD"
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.api.get('table/qc_out', { params: { limit: 10, filter: "status='OPEN'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                      .subscribe(val => {
                                        this.quality_control = val['data'];
                                        this.totaldataqc = val['count'];
                                      });
                                    this.api.get('table/qc_out', { params: { limit: 10, filter: "status='CLSD'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                      .subscribe(val => {
                                        this.quality_control_clsd = val['data']
                                      });
                                  });
                              }
                              this.api.get('table/qc_out', { params: { limit: 10, filter: "status='OPEN'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                .subscribe(val => {
                                  this.quality_control = val['data'];
                                  this.totaldataqc = val['count'];
                                });
                              this.api.get('table/qc_out', { params: { limit: 10, filter: "status='CLSD'  AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
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
  doRejectQCOut() {
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
                      this.api.put("table/qc_out_result",
                        {
                          "qc_result_no": this.qcnoresult,
                          "date_finish": date,
                          "time_finish": time,
                          "qc_status": "REJECT",
                          "qc_description": data.description
                        },
                        { headers })
                        .subscribe(val => {
                          this.api.get("table/qc_out_result", { params: { filter: 'qc_result_no=' + "'" + this.qcnoresult + "'" } }).subscribe(val => {
                            let datareject = val['data'];
                            let uuidreject = UUID.UUID();
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            this.api.post("table/qc_out_result_reject",
                              {
                                "qc_result_no": datareject[0].qc_result_no,
                                "qc_no": datareject[0].qc_no,
                                "receipt_no": datareject[0].receipt_no,
                                "batch_no": '',
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
                                      this.doInsertfotoOut(datai, uuidreject)
                                    }
                                  });
                                document.getElementById("myQCChecking").style.display = "none";
                                document.getElementById("myBTNChecking").style.display = "none";
                                document.getElementById("myHeader").style.display = "block";
                                this.button = false;
                                this.qcnoresult = '';
                                this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                                  this.qcresult = val['data'];
                                  this.totaldataqcresult = val['count'];
                                });
                                this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" } }).subscribe(val => {
                                  this.qcresult = val['data'];
                                  this.totaldataqcresult = val['count'];
                                  this.api.get("table/qc_out_result", { params: { filter: 'qc_no=' + "'" + this.qcno + "'" + " AND " + "qc_status='OPEN'" } }).subscribe(val => {
                                    this.qcresultopen = val['data'];
                                    this.totaldataqcresultopen = val['count'];
                                    if ((this.totaldataqcresult == this.qcqty) && this.totaldataqcresultopen == 0) {
                                      const headers = new HttpHeaders()
                                        .set("Content-Type", "application/json");
                                      this.api.put("table/qc_out",
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
                                          this.api.get('table/qc_out', { params: { limit: 10, filter: "status='OPEN'   AND (pic = '" + this.userid + "' OR pic_admin='" + this.roleid + "')" } })
                                            .subscribe(val => {
                                              this.quality_control = val['data'];
                                              this.totaldataqc = val['count'];
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
  doInsertfotoOut(datai, uuidreject) {
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
          this.doInsertfotoOut(datai, uuidreject);
        });
  }
  doInsertQCResultOut(datai, nextnoqc) {
    let time = moment().format('HH:mm:ss');
    let date = moment().format('YYYY-MM-DD');
    let datetime = moment().format('YYYYMMDDHHmm');
    let uuid = UUID.UUID();
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/qc_out_result",
      {
        "qc_result_no": datai["Receipt No_"] + datai["Item No_"] + datetime,
        "qc_no": nextnoqc,
        "receipt_no": datai["Receipt No_"],
        "batch_no": '',
        "item_no": datai["Item No_"],
        "qc_pic": this.userid,
        "qty_receiving": datai.Quantity,
        "unit": datai.UOM,
        "qc_status": "OPEN",
        "qc_description": "",
        "uuid": uuid
      },
      { headers })
      .subscribe(val => {
      }, err => {
        this.doInsertQCResultOut(datai, nextnoqc);
      });
  }
  viewDetailTO(to) {
    this.navCtrl.push('TransferorderPage', {
      rolecab: this.rolecab,
      userid: this.userid
    });
  }
  viewDetailPicking(picking) {
    this.navCtrl.push('PickingdetailpartPage', {
      receiptno: picking.receipt_no
    });
  }
}
