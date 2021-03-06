import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';

import * as $ from 'jquery';
import * as _ from 'lodash';
import { Md5 } from 'ts-md5/dist/md5';

import { SelectServiceComponent } from '../../market/selectservice/selectservice.component';

import { HouseinfoService } from '../../house/houseinfo/houseinfo.services';
import { CheckinService } from './checkin.services';
import { ReadIdCardService } from './idcardread.services';
import { HouseTypeService } from '../../market/house-type/house-type.services';
import { SetPaytypeService } from '../../sys/set-paytype/set-paytype.services';
import { DicService } from '../../sys/dic/dic.services';
import { BookService } from '../book/book.services';

import { GlobalState } from '../../../global.state';
import { ButtonViewComponent } from './buttonview.component';
import { retry } from 'rxjs/operator/retry';
import { ReturnStatement } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-qt-checkin',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss'],
  providers: [CheckinService, HouseinfoService, ReadIdCardService, HouseTypeService, SetPaytypeService, DicService, BookService],
})
export class CheckinComponent implements OnInit {
  @Input() showEditButton: boolean = true;
  @ViewChild(SelectServiceComponent)
  private serviceComponent: SelectServiceComponent;

  title = '客人入住';
  private isSaved: boolean = false;

  private checkIn: any = {
    cusname: '',
    cusphone: '',
    idCard: '',
    inType: 100,
    comeType: '',
    payType: '',
    billNo: '',
    remark: '',
    houseFee: 0,
    prereceivefee: 0,
    bookOrderNo: ''
  };
  private selectedRow: any;
  private paytype: any = [];
  private checkinType: any = [
    { id: 100, name: '全天房' }, { id: 200, name: '钟点房' }, { id: 300, name: '特殊房' }, { id: 400, name: '免费房' }
  ];
  private comeType: any = [];
  settingsHouse = {
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
    noDataMessage: '',
    add: {
      addButtonContent: '<i class="ion-ios-plus-outline"></i>',
      confirmCreate: true,
    },
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    columns: {
      houseTypeTxt: {
        title: '房型',
        type: 'string',
        filter: false,
        editable: false
      },
      houseCode: {
        title: '房号',
        type: 'number',
        filter: false,
        editable: false
      },
      houseFee: {
        title: '房费',
        type: 'number',
        filter: false,
        editable: false
      },
      days: {
        title: '入住天数',
        type: 'number',
        filter: false
      },
      coupons: {
        title: '早餐券',
        type: 'number',
        filter: false
      },
      cusname: {
        title: '客人姓名',
        type: 'string',
        filter: false
      },
      idcard: {
        title: '客人身份证',
        type: 'string',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      },
      button: {
        title: '...',
        type: 'custom',
        renderComponent: ButtonViewComponent,
        onComponentInitFunction(instance) {
          instance.save.subscribe(row => {
            alert(`${row.name} saved!`)
          });
        },
        editable: false
      }
    }
  };

  settings = {
    actions: {
      add: false,
      edit: false,
      delete: false
    },
    mode: 'external',
    selectMode: 'multi',
    hideSubHeader: true,
    columns: {
      code: {
        title: '房号',
        type: 'string',
        filter: false,
        width: '60px',
      },
      houseTypeTxt: {
        title: '房型',
        type: 'string',
        filter: false,
        width: '70px',
      },
      houseFee: {
        title: '房费',
        type: 'string',
        filter: false,
        width: '70px',
      },
      stateTxt: {
        title: '房屋状态',
        type: 'string',
        filter: false,
        width: '70px',
      }
    }
  };
  houseType = [];
  houseInfoSelect = [];
  //选择房间表格
  selectedGrid: LocalDataSource = new LocalDataSource();
  //弹出框选择
  popGrid: LocalDataSource = new LocalDataSource();
  //选择的房间
  selectedHouse: any = [];

  //链接过来的房间号
  private checkInCode: string;

  constructor(
    private _state: GlobalState,
    private _checkinService: CheckinService,
    private _houseinfoService: HouseinfoService,
    private _houseTypeService: HouseTypeService,
    private _readIdCardService: ReadIdCardService,
    private _setPaytypeService: SetPaytypeService,
    private _bookService: BookService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    fb: FormBuilder) {
  }
  ngOnInit() {
    this._state.subscribe('read.idcard', (data) => {
      let newrowdata = _.find(this.selectedHouse, function (o) { return o['houseCode'] == data.code; });
      if (newrowdata) {
        newrowdata['cusname'] = data.name;
        newrowdata['idcard'] = data.idcard;
      }
      this.selectedGrid.refresh();
    });

    this.checkInCode = this.route.snapshot.params['code'];
    this.checkIn.bookOrderNo = this.route.snapshot.queryParams["orderNo"];
    const id = this.route.snapshot.queryParams["id"];

    Promise.all([this.getDataList(), this.getPaytypeService(), this.getDic()])
      .then(() => {
        if (this.checkIn.bookOrderNo) {
          this.title = this.title + "（预约单号：" + this.checkIn.bookOrderNo + "）";
          this.getBookOrder(id);
          // this.serviceComponent.setDisableEdit(false);
          this.serviceComponent.loadData(this.checkIn.bookOrderNo);
        }
      });
  }
  onSubmit(values: Object): void {
  }

  readCard() {
    const cust = this._readIdCardService.getIDcard();
    this.checkIn.cusname = cust.name;
    this.checkIn.idCard = cust.idcard;
  }
  //从预约订单链接过来的
  getBookOrder(id) {
    this._bookService.getBookById(id).then((data) => {
      if (data) {
        this.checkIn.cusname = data['cusName'];
        this.checkIn.cusphone = data['mobile'];
        this.checkIn.idCard = data['idCard'];
        this.checkIn.inType = data['checkInType'];

        const houses = _.filter(this.houseInfoSelect, (f) => { return f['state'] == '1001' && f['houseType'] == data['houseTypeId']; });
        if (houses) {
          //预定房间数
          for (let i = 0; i < data['houseNum']; i++) {
            let hs = houses[i];
            this.selectedHouse.push({
              houseTypeTxt: hs['houseTypeTxt'],
              houseType: hs['houseType'],
              houseCode: hs['code'],
              days: data['days'],
              coupons: 1,
              cusname: this.checkIn.cusname,
              idcard: this.checkIn.idCard,
              button: '读取身份证_' + hs['code'],
              prereceivefee: hs['preFee'],
              houseFee: hs['houseFee']
            });
          }
          this.refreshTable();
        }
      }
    });
  }

  getDataList() {
    const that = this;
    var p = new Promise(function (resolve, reject) {
      //待选择的房价
      that._houseinfoService.getHouseinfos().then((data) => {
        that.houseInfoSelect = _.filter(data, (f) => { return f['state'] == '1001'; });

        //初始化链接过来的房屋
        if (that.checkInCode) {
          const findHouse = _.find(data, f => { return f['code'] == that.checkInCode; });
          that.setCheckInHouse(findHouse);
        }
        that.popGrid.load(that.houseInfoSelect);
        that.getHouseType();
        resolve();
      });
    });
    return p;
  }

  getPaytypeService() {
    const that = this;
    var p = new Promise(function (resolve, reject) {
      that._setPaytypeService.getSetPaytypes().then((data) => {
        _.each(data, function (d) {
          that.paytype.push({ id: d.id, name: d.name });
        });
        resolve();
      });
    });
    return p;
  }

  getDic() {
    const that = this;
    var p = new Promise(function (resolve, reject) {
      that._dicService.getDicByName('客源', (data) => {
        that.comeType = data;
        resolve();
      });
    });
    return p;
  }

  setCheckInHouse(house) {
    this.selectedHouse.push(
      {
        houseTypeTxt: house['houseTypeTxt'],
        houseType: house['houseType'],
        houseCode: house['code'],
        days: 1,
        coupons: 1,
        cusname: this.checkIn.cusname,
        idcard: this.checkIn.idCard,
        button: '读取身份证_' + house['code'],
        prereceivefee: house['preFee'],
        houseFee: house['houseFee']
      });
    this.refreshTable();
  }

  getHouseType() {
    //房型
    this._houseTypeService.getHouseTypes().then((data) => {
      const that = this;
      const houseTypeCount = _.countBy(this.houseInfoSelect, 'houseType');
      _.each(data, function (d) {
        //计算房型的数量
        if (houseTypeCount[d.id]) {
          d.count = houseTypeCount[d.id];
        } else {
          d.count = 0;
        }
        that.houseType.push({ type: d.typeName, id: d.id, color: 'btn-info', icon: 'fa-refresh', count: d.count });
      });
    });
  }
  //选择房间
  rowClicked(event): void {
    if (event.isSelected) {
      if (!_.some(this.selectedHouse, ['code', event.data.code])) {
        this.selectedHouse.push(
          {
            houseTypeTxt: event.data.houseTypeTxt,
            houseType: event.data.houseType,
            houseCode: event.data.code,
            days: 1,
            coupons: 1,
            cusname: this.checkIn.cusname,
            idcard: this.checkIn.idCard,
            button: '读取身份证_' + event.data.code,
            prereceivefee: event.data.preFee,
            houseFee: event.data.houseFee
          });
      }
    } else {
      _.remove(this.selectedHouse, function (n) {
        return n['code'] == event.data.code;
      });
    }
    this.refreshTable();
  }
  //刷新表格数据
  refreshTable() {
    this.checkIn.prereceivefee = _.sumBy(this.selectedHouse, function (o) { return o['prereceivefee']; });
    this.checkIn.houseFee = _.sumBy(this.selectedHouse, function (o) { return o['houseFee'] * o['days']; });
    this.selectedGrid.load(this.selectedHouse);
  }
  // 删除
  onDeleteConfirm(event): void {
    if (window.confirm('你确定要删除吗?')) {
      _.remove(this.selectedHouse, function (n) {
        return n['code'] == event.data.code;
      });
      this.checkIn.prereceivefee = _.sumBy(this.selectedHouse, function (o) { return o['prereceivefee']; });
      this.checkIn.houseFee = _.sumBy(this.selectedHouse, function (o) { return o['houseFee']; });
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }
  onSaveConfirm(event): void {
    event.confirm.resolve();
  }

  onUserRowSelect(event) {
    this.selectedRow = event.data;
  }
  showPop(event): void {
    _.delay(function (text) {
      $(".popover").css("max-width", "520px");
    }, 100, 'later');
  }
  onSearch(query: string = '') {
    this.popGrid.setFilter([
      { field: 'houseType', search: query },
    ], false);
  }
  onSelectHouseType(id: number) {
    this.popGrid.load(_.filter(this.houseInfoSelect, (f) => { return f['houseType'] == id; }));
  }
  onKeyPress(event: any) {
    event.returnValue = false;
    // let keyCode = event.keyCode;
    // if ((keyCode >= 48 && keyCode <= 57){
    //   event.returnValue = true;
    // } else {
    //   event.returnValue = false;
    // }
  }
  //确认入住
  onConfirm(): void {
    if (!this.checkIn.cusname || !this.checkIn.cusphone || !this.checkIn.idCard || !this.checkIn.inType || !this.checkIn.payType) {
      const msg = "请填写完整。";
      this._state.notifyDataChanged("showMessage.open", { message: msg, type: "warning", time: new Date().getTime() });
      return;
    }
    if (this.selectedHouse.length == 0) {
      const msg = "请选择房间。";
      this._state.notifyDataChanged("showMessage.open", { message: msg, type: "warning", time: new Date().getTime() });
      return;
    }
    this.isSaved = true;
    const that = this;
    this._checkinService.create(
      {
        YxOrder: this.checkIn,
        YxOrderList: this.selectedHouse
      }
    ).then(
      function (v) {
        const msg = "保存成功。";
        that._state.notifyDataChanged("showMessage.open", { message: msg, type: "success", time: new Date().getTime() });
        that.isSaved = false;
        that.checkIn.cusname = '';
        that.checkIn.cusphone = '';
        that.checkIn.idCard = '';
        that.checkIn.inType = '';
        that.checkIn.remark = '';
        that.checkIn.houseFee = '';
        that.checkIn.prereceivefee = '';
        that.checkIn.payType = '';
        that.checkIn.billNo = '';
        that.checkIn.bookOrderNo = '';
        that.checkIn.comeType='';
        that.selectedHouse = [];
        that.selectedGrid.load(that.selectedHouse);
      },
      (err) => {
        that._state.notifyDataChanged("showMessage.open", { message: err, type: "error", time: new Date().getTime() });
        that.isSaved = false;
      }
    )
  }
}
