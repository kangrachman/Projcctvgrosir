import { Component, OnInit, ChangeDetectorRef, ViewChild, ɵConsole } from '@angular/core';
import { API_URL_SLIDER, IMAGE_URL_PRODUCT } from '../../providers/constant.service';
import { HttpClient } from '@angular/common/http';
import { of, from } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { AlertController, IonList, LoadingController, ModalController, NavController, ToastController, Config, IonCheckbox, IonSelect } from '@ionic/angular';
import { ProductFilterPage } from '../../product-filter/product-filter.page';
import { Router } from '@angular/router';
import { DataCartService } from '../../services/data-cart.service';
import { NgxCommunicateService } from 'ngx-communicate';
import { API_RAJAONKIR } from '../../providers/constant.service';
import { ConstantService } from '../../providers/constant.service';
import { UserData } from '../../providers/user-data';

@Component({
  selector: 'cek-ongkir',
  templateUrl: './cek-ongkir.page.html',
  styleUrls: ['./cek-ongkir.page.scss'],
})
export class CekOngkirPage implements OnInit {
  master_pengiriman : any;
  data_pelanggan : any = {};
  nama_pengirim : any;
  no_telp_pengirim : any;
  alamat_pengirim : any;
  pilihan_tipe_pengiriman : any;
  nama_penerima: any;
  no_telp_penerima: any;
  alamat_penerima : any;
  type_pengiriman : any = [
    {val : 1, label : 'Dikirim ke alamat sendiri'},
    {val : 2, label : 'Di kirim ke alamat lain (Dropship)'},
    {val : 3, label : 'Paket diambil di toko(COD)'},
  ]
  data_user: any = {};
  catatan_pengiriman: any;
  setselected_pengiriman: any = {};
  setselected_kurir: any;
  setselected_kota:any;
  setselected_kecamatan:any="";
  setselected_provinsi:any;
  kurir_terpilih: any =  '';
  data_kurir:any;
  data_provinsi:any = [];
  data_kota:any;
  data_kecamatan:any;
  id_kecamatan:any = '';
  data_paket:any;
  paket_terpilih:any;
  summary: any = {};
  propinsi_terpilih:any;
  kota_terpilih:any;
  kecamatan_terpilih:any;
  loading:any;
  loading1:any;
  @ViewChild('select_pengiriman', null) select_pengiriman: IonSelect;
  @ViewChild('select_provinsi', null) select_provinsi: IonSelect;
  @ViewChild('select_kota', null) select_kota: IonSelect;
  @ViewChild('select_kecamatan', null) select_kecamatan: IonSelect;
  @ViewChild('select_paket', null) select_paket: IonSelect;

  constructor(
    public http: HttpClient,
    public modalCtrl: ModalController,
    public router: Router,
    public navCtrl: NavController,
    public servcart: DataCartService,
    public loadingctrl: LoadingController,
    public alertctrl: AlertController,
    private combroadcast: NgxCommunicateService,
    private consta: ConstantService,
    public changeref : ChangeDetectorRef,
    private userdata: UserData


  ) { 
  }

  ngOnInit() {
    // this.pilihan_tipe_pengiriman=1;
    this.get_api_provinsi();
  }
  ionViewWillEnter() {
    this.setselected_pengiriman= 'Dikirim ke alamat sendiri';
    this.pilihan_tipe_pengiriman=1;
    this.userdata.getUsername().then( hsl => {
      console.log(hsl, 'hasil');
      if(hsl==null){
        this.router.navigateByUrl('login');
      }else{
        this.data_user=hsl;
        this.get_master_pengiriman();
        // this.hitung_summary(0, this.data_user.id_pel);
        // this.get_api_provinsi();
      }
    });
    // this.select_pengiriman.value=1;
  }
  pilih_tipe_pengiriman($event){
      this.pilihan_tipe_pengiriman=$event.target.value;
      let str = this.type_pengiriman.filter( hsl => {
        return hsl.val==$event.target.value;
      })
      console.log($event.target.value, str, 'xxxx')
      this.setselected_pengiriman = str[0].label;
      if(this.pilihan_tipe_pengiriman==1 || this.pilihan_tipe_pengiriman==3){        
        this.nama_penerima = this.data_pelanggan.nama_pel;
        this.no_telp_penerima = this.data_pelanggan.no_telp_pel;
        this.alamat_penerima = this.data_pelanggan.alamat_pel;
        this.nama_pengirim = '';
        this.no_telp_pengirim = '';
        this.alamat_pengirim = '';      
      }else{
        this.nama_penerima = '';
        this.no_telp_penerima = '';
        this.alamat_penerima = '';
        this.nama_pengirim = this.data_pelanggan.nama_pel;
        this.no_telp_pengirim = this.data_pelanggan.no_telp_pel;
        this.alamat_pengirim = this.data_pelanggan.alamat_pel;        
      }
  }
  pilih_kurir($event){
    this.kurir_terpilih=$event.target.value.kurir;
    this.data_paket = [];
    this.select_paket.selectedText = null;
    this.select_paket.value = null;
    this.hitung_harga(this.id_kecamatan, this.kurir_terpilih);
  }
  async get_prov_cek(data : any): Promise<any>{
    return new Promise((resolve: any, reject: any) => {
        let hasil = data.filter( hasl => {
          let hasilx : any = {};
          hasilx = hasl;
          return this.data_user.provinsi_pel.match( new RegExp(hasilx.province, 'gi'));
          // return hasl.province == this.data_user.provinsi_pel;
        })
        resolve(hasil);
    })
  }
  get_prov_kota(data : any): Promise<any>{
    return new Promise((resolve: any, reject: any) => {
        let hasil = data.filter( hasl => {
          let hasilx : any = {};
          hasilx = hasl;
          return this.data_user.kota_pel.match( new RegExp(hasilx.city_name, 'gi'));
        })
        console.log(hasil, 'HASIIIILxxxxx')
        resolve(hasil);
    })
  }
  get_prov_kecamatan(data : any): Promise<any>{
    return new Promise((resolve: any, reject: any) => {
        let hasil = data.filter( hasl => {
          let hasilx : any = {};
          hasilx = hasl;
          return this.data_user.kecamatan_pel.match( new RegExp(hasilx.subdistrict_name, 'gi'));
        })
        console.log(hasil, 'HASIIIIL KECAMATAN')
        resolve(hasil);
    })
  }     
  async get_api_provinsi(){
    this.loading1 = await this.loadingctrl.create({
      message: 'Silahkan tunggu system sedang mengambil data propinsi....'
    });
    this.loading1.present();
    this.servcart.get_rajaongkir_provinsi().then(hsl=>{
      console.log(hsl, 'hasil provinsi');
      let hasil: any = {};
      hasil = hsl;
      this.data_provinsi = hasil.data.rajaongkir.results;
      this.loading1.dismiss();

      this.get_prov_cek(hasil.data.rajaongkir.results).then( hsl =>{
        let hasil : any = {};
         hasil = hsl;
         console.log(hasil, 'HAXXXXXX')
        //  let even : any = {}
        //  even = { target : { value : { province_id : hasil[0].province_id } }}
         if(hsl){
          this.loading1.dismiss();
          // this.pilih_provinsi(even);
          this.select_provinsi.selectedText = hasil[0].province
          this.select_provinsi.value = hasil[0];
         }
      })
      console.log(this.data_provinsi, 'data provinsi');
    })

  }
  async pilih_provinsi($event){
    console.log($event, 'TYPE');
    this.propinsi_terpilih=$event.detail.value;
    let id_provinsi = $event.detail.value.province_id;
    this.select_provinsi.selectedText = $event.detail.value.province
    this.loading = await this.loadingctrl.create({
      message: 'Silahkan tunggu system sedang mengambil data kota....'
    });
    this.loading.present();  
    this.data_kota = [] 
    this.select_kota.selectedText = null; 
    this.select_kota.value = null;
    if($event.detail.value==null){
      return;
    }
        console.log('jancuk1')
        this.servcart.get_rajaongkir_kota(id_provinsi).then(hsl => {
          let hasil: any = {};
          hasil = hsl;
          this.data_kota = hasil.data.rajaongkir.results;
          this.get_prov_kota(this.data_kota).then( hsl =>{
            console.log(hsl, 'hasil jancuk1')
            let hasil : any = {};
            hasil = hsl;

            if(hsl!=''){
              this.loading.dismiss();
              console.log(hasil, 'get data kota')
              this.select_kota.selectedText = hasil[0].city_name
              this.select_kota.value = hasil[0];
            }else{
              this.select_kota.selectedText = null;
              this.select_kota.value = null;
              this.setselected_kota = null;
            }
          })    
          this.loading.dismiss();
        })
  }
  async pilih_kota($event){
    console.log($event, 'pilih kota')
    this.data_kecamatan = [];  
    this.select_kecamatan.selectedText = null;
    this.select_kecamatan.value=null;
    if($event.detail.value==null){
      return;
    }
    this.kota_terpilih=$event.detail.value;
    let id_kota = $event.detail.value.city_id;
    this.select_kota.selectedText = $event.detail.value.city_name;
    this.loading = await this.loadingctrl.create({
      message: 'Silahkan tunggu system sedang mengambil data kecamatan....'
    });
    this.loading.present();  

    this.servcart.get_rajaongkir_kecamatan(id_kota).then(hsl => {
      let hasil: any = {};
      hasil = hsl;
      this.data_kecamatan = hasil.data.rajaongkir.results;
      this.get_prov_kecamatan(this.data_kecamatan).then( hsl =>{
        console.log(hsl, 'get data kecamatan')
        let hasil : any = {};
         hasil = hsl;
         if(hsl!=''){
          this.loading.dismiss();
          this.select_kecamatan.selectedText = hasil[0].subdistrict_name
          this.select_kecamatan.value = hasil[0];
         }else{
          this.select_kecamatan.selectedText = null;
         }
      }) 
      this.loading.dismiss();
    })
  }
  pilih_kecamatan($event){
    if($event.detail.value==null){
      return;
    }
    this.kecamatan_terpilih=$event.detail.value;
    this.id_kecamatan=$event.detail.value.subdistrict_id;
    this.hitung_harga(this.id_kecamatan, this.kurir_terpilih);
  } 
  async hitung_harga(id_kecamatan, kurir){
    // if(id_kecamatan=='' || id_kecamatan==null){
    //   this.consta.show_alert('Error', '', 'Silahkan pilih kecamatan');
    //   return;
    // }
    // if(kurir=='' || kurir==null){
    //   this.consta.show_alert('Error', '', 'Silahkan pilih kurir');
    //   return;
    // }
    this.loading = await this.loadingctrl.create({
      message: 'Silahkan tunggu system sedang mengambil data paket....'
    });
    this.loading.present();    
    this.servcart.get_rajaongkir_harga(id_kecamatan, kurir).then( hsl => {
      let hasil: any = {};
      hasil = hsl;
      this.data_paket = hasil.arr_paket;
      this.loading.dismiss();
      console.log(this.data_paket, 'data paket')
    })
  } 
  pilih_paket($event){
    console.log($event)
    if($event.detail.value==null){
      return;
    }
    this.paket_terpilih=$event.detail.value;
    // this.hitung_summary($event.target.value.cost, this.data_user.id_pel);
  }
  async hitung_summary(cost, id_pel){
    this.loading = await this.loadingctrl.create({
      message: 'Silahkan tunggu system sedang menghitung total....'
    });
    this.loading.present();    
    this.servcart.get_rajaongkir_summary(cost, id_pel).then(hsl=>{
      let hasil: any = {};
      hasil = hsl;
      this.summary = hasil;
      console.log(hasil, 'summary')
      this.loading.dismiss();
    })
  }
  async save_pengiriman(){
    this.loading = await this.loadingctrl.create({
      message: 'Silahkan tunggu proses penyimpanan pengiriman sedang berlansung...'
    });
      let id_pel = this.data_user.id_pel;
      let catatan_pengiriman = this.catatan_pengiriman;
      let ongkir_provinsi = this.propinsi_terpilih.province;
      let ongkir_kota = this.kota_terpilih.city_name;
      let ongkir_kecamatan = this.kecamatan_terpilih.subdistrict_name;

      if(catatan_pengiriman=='' || catatan_pengiriman==null){
        this.consta.show_alert('Error', '', 'Catatan tidak boleh kosong');
        return false;
      }      
      let paket = this.paket_terpilih.service;
      if(paket=='' || paket==null){
        this.consta.show_alert('Error', '', 'Silahkan pilih paket terlebih dulu');
        return false;
      }      
      let perkilo = this.paket_terpilih.cost;
      let kurir = this.kurir_terpilih;
      let nama = this.nama_penerima;
      let telepon = this.no_telp_penerima;
      let nama_pengirim = this.nama_pengirim;
      let no_pengirim = this.no_telp_pengirim;
      let pilihan_form=this.pilihan_tipe_pengiriman;
      let alamat = this.alamat_penerima;
      let alamat_pengirim = this.alamat_pengirim;

      await this.loading.present();
      this.servcart.get_rajaongkir_save_pengiriman(id_pel, paket, perkilo, kurir, nama, telepon, nama_pengirim, 
        no_pengirim, pilihan_form, ongkir_provinsi, ongkir_kota, ongkir_kecamatan, alamat, alamat_pengirim, catatan_pengiriman).then( hsl => {
          console.log(hsl, 'HASIL PENGIRIMAN')
          let hasil : any = {};
          hasil = hsl;
          this.loading.dismiss();
          if(hasil.code==1){
            this.consta.show_alert('Sukses', '', hasil.msg).then( hsl => {
              this.router.navigateByUrl('product')
            })
          }else{
            this.consta.show_alert('Gagal', '', hasil.msg);
          }
        }).catch( err => {
          this.loading.dismiss();
        }).finally( () => {
          this.loading.dismiss();
        })
  }
  get_master_pengiriman(){
    this.servcart.master_pengiriman(this.data_user.id_pel).then((data)=>{
      let hsl : any = {};
      hsl = data;
      console.log(hsl, 'hsl');
      this.master_pengiriman= hsl.data;
      this.data_pelanggan =  hsl.data.pelanggan[0];
      this.data_kurir = hsl.data.kurir;
      console.log(this.data_kurir, 'data kurir')
      this.nama_pengirim = this.data_pelanggan.nama_pel;
      this.no_telp_pengirim = this.data_pelanggan.no_telp_pel;
      this.alamat_pengirim = this.data_pelanggan.alamat_pel;
      if(this.pilihan_tipe_pengiriman==1 || this.pilihan_tipe_pengiriman==3){        
        this.nama_penerima = this.data_pelanggan.nama_pel;
        this.no_telp_penerima = this.data_pelanggan.no_telp_pel;
        this.alamat_penerima = this.data_pelanggan.alamat_pel;
        this.nama_pengirim = '';
        this.no_telp_pengirim = '';
        this.alamat_pengirim = '';      
      }else{
        this.nama_penerima = '';
        this.no_telp_penerima = '';
        this.alamat_penerima = '';
        this.nama_pengirim = this.data_pelanggan.nama_pel;
        this.no_telp_pengirim = this.data_pelanggan.no_telp_pel;
        this.alamat_pengirim = this.data_pelanggan.alamat_pel;        
      }
    })
  }
}
