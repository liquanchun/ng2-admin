import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { Common } from '../../../../providers/common';
import * as $ from 'jquery';
import * as _ from 'lodash';

import { StoreoutNewService } from './storeoutnew.services';
import { DicService } from '../../../sys/dic/dic.services';
import { UserService } from '../../../sys/components/user/user.services';
import { OrgService } from '../../../staff/org/org.services';

import { GlobalState } from '../../../../global.state';
import { GoodsstoreService } from '../../goodsstore/goodsstore.services';
import { GoodsService } from '../../goods/goods.services';
import { retry } from 'rxjs/operator/retry';
import { ReturnStatement } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-storeoutnew',
  templateUrl: './storeoutnew.component.html',
  styleUrls: ['./storeoutnew.component.scss'],
  providers: [StoreoutNewService, DicService, GoodsstoreService, GoodsService, UserService, OrgService],
})
export class StoreoutNewComponent implements OnInit {
  @Input() showEditButton: boolean = true;
  title = '新增商品出库';
  isSaved: boolean = false;
  isEnable: boolean = true;
  storeOut: any = {
    typeId: 0,
    outTime: '',
    outTimeNg: {},
    storeId: '',
    orgid: '',
    orgidNg: [],
    orgtext: '',
    operator: 0,
    amount: 0,
    orderNo: '',
    remark: ''
  };
  //选择的行
  selectedRow: any;
  //仓库
  stores: any = [];
  //出库类型
  outType: any = [];
  //用户
  users: any = [];
  //商品类别
  goodsType: any = [];
  //采购人
  operatorList = [];
  //商品信息
  goodsInfo: any = [];
  //库存信息
  goodsStoreInfo: any = [];
  //选中的商品信息
  selectedGoods: any = [];
  //选中的仓库
  checkedStoreId: number;
  //选中的商品信息表格
  selectedGrid: LocalDataSource = new LocalDataSource();
  //弹出框表格
  popGrid: LocalDataSource = new LocalDataSource();

  settingsGoods = {
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
      saveButtonContent: '保存',
      cancelButtonContent: '取消',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    columns: {
      name: {
        title: '商品名称',
        type: 'string',
        filter: false,
        editable: false
      },
      unit: {
        title: '商品型号',
        type: 'string',
        filter: false,
        editable: false
      },
      goodscode: {
        title: '商品编码',
        type: 'string',
        filter: false,
        editable: false
      },
      price: {
        title: '单价',
        type: 'number',
        filter: false,
        editable: false
      },
      number: {
        title: '数量',
        type: 'number',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'number',
        filter: false
      },
      amount: {
        title: '金额',
        type: 'number',
        filter: false,
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
      goodsTypeIdTxt: {
        title: '商品类别',
        type: 'string',
        filter: false,
      },
      goodsIdTxt: {
        title: '商品名称',
        type: 'string',
        filter: false,
      },
      unit: {
        title: '单位规格',
        type: 'string',
        filter: false,
      },
      number: {
        title: '库存量',
        type: 'number',
        filter: false,
      }
    }
  };

  myOptions: IMultiSelectOption[];
  myOptionsOper: IMultiSelectOption[];
  mySettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3,
    selectionLimit: 1,
    autoUnselect: true,
  };
  mySettingsOper: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3,
  };
  myTexts: IMultiSelectTexts = {
    defaultTitle: '--选择--',
    searchPlaceholder: '查询...'
  }

  constructor(
    private _common: Common,
    private _state: GlobalState,
    private _storeoutNewService: StoreoutNewService,
    private _goodsStoreService: GoodsstoreService,
    private _goodsService: GoodsService,
    private _userService: UserService,
    private _dicService: DicService,
    private _orgService: OrgService,
    private _router: Router,
    private route: ActivatedRoute) {

  }
  ngOnInit() {
    this.getDataList();
    this.getOrderNo();
    this.storeOut.outTimeNg = this._common.getTodayObj();
  }
  getOrderNo(): void {
    this._storeoutNewService.getOrderNo().then((data) => {
      this.storeOut.orderNo = data['data'];
    });
  }
  getDataList(): void {
    this._goodsStoreService.getGoodsstores().then((data) => {
      this.popGrid.load(data);
      this.goodsStoreInfo = data;
    });
    this._goodsService.getGoodss().then((data) => {
      this.goodsInfo = data;
    });
    this._userService.getUsers().then((data) => {
      this.users = data;
    });

    this._orgService.getAll().then((data) => {
      const that = this;
      const optData = [];
      _.each(data, f => {
        optData.push({ id: f['id'], name: f['deptName'] });
      });
      this.myOptions = optData;
    });

    this._dicService.getDicByName('仓库', (data) => { this.stores = data; });
    this._dicService.getDicByName('出库类型', (data) => { this.outType = data; });
    this._dicService.getDicByName('商品类别', (data) => { this.goodsType = data; });
  }

  //选择房间
  rowClicked(event): void {
    if (event.isSelected) {
      const goodsname = event.data.goodsIdTxt;
      const goodsObj = _.find(this.goodsInfo, f => { return f['name'] == goodsname; });
      if (!_.some(this.selectedGoods, ['name', goodsname])) {
        this.selectedGoods.push(
          {
            goodsTypeId: goodsObj['typeId'],
            goodsId: goodsObj['id'],
            price: goodsObj['price'],
            name: goodsObj['name'],
            unit: goodsObj['unit'],
            number: 1,
            batchno: '',
            amount: goodsObj['price'],
          });
      }
    } else {
      _.remove(this.selectedGoods, function (n) {
        return n['name'] == event.data.goodsIdTxt;
      });
    }
    this.isEnable = this.selectedGoods.length == 0;
    this.selectedGrid.load(this.selectedGoods);
    this.storeOut.amount = _.sumBy(this.selectedGoods, function (o) { return o['amount']; });
  }
  onStoreClick(event) {
    if (event.target.value && event.target.value > 0) {
      this.checkedStoreId = event.target.value;
      this.popGrid.load(_.filter(this.goodsStoreInfo, f => { return f['storeId'] == event.target.value; }));
    }
  }
  //刷新表格数据
  refreshTable() {
    this.selectedGrid.refresh();
  }
  // 删除
  onDeleteConfirm(event): void {
    if (window.confirm('你确定要删除吗?')) {
      _.remove(this.selectedGoods, function (n) {
        return n['name'] == event.data.name;
      });
      this.isEnable = this.selectedGoods.length == 0;
      this.refreshTable();
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }
  onEditConfirm(event): void {
    const dt = { that: this, data: event.newData };
    const store = _.find(this.goodsStoreInfo,f => { return f['goodsIdTxt'] == event.data.name});
    if(store['number'] < _.toNumber(event.newData.number)){
      const msg = "出库数量不能大于库存数量。";
      this._state.notifyDataChanged("showMessage.open", { message: msg, type: "warning", time: new Date().getTime() });
      event.confirm.reject();
      return;
    }
    event.confirm.resolve();
    _.delay(function (dt) {
      const that = dt.that;
      _.each(that.selectedGoods, f => {
        if (f['name'] == event.data.name) {
          f['amount'] = _.toNumber((_.toNumber(dt.data['price']) * _.toNumber(dt.data['number'])).toFixed(2));
        }
      });
      that.selectedGrid.load(that.selectedGoods);
      that.storeOut.amount = _.sumBy(that.selectedGoods, function (o) { return o['amount']; });
    }, 50, dt);
  }

  onUserRowSelect(event) {
    this.selectedRow = event.data;
  }
  showPop(event): void {
    _.delay(function (text) {
      $(".popover").css("max-width", "520px");
      $(".popover").css("min-width", "400px");
    }, 100, 'later');
  }

  onSearch(query: string = '') {
    this.popGrid.setFilter([
      { field: 'name', search: query },
      { field: 'id', search: query },
    ], false);
  }
  //选择商品类型
  onSelectGoodsType(id: number) {
    if (this.checkedStoreId && this.checkedStoreId > 0) {
      this.popGrid.load(_.filter(this.goodsStoreInfo, (f) => { return f['typeId'] == id && f['storeId'] == this.checkedStoreId; }));
    } else {
      this.popGrid.load(_.filter(this.goodsStoreInfo, (f) => { return f['typeId'] == id; }));
    }
  }

  onChange(event) {
    this.onSelectGoodsType(event.target.value);
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
  onSelectedOrg(orgId) {
    if (orgId) {
      this.storeOut.orgid = orgId;
      //this.storeOut.orgtext = org.name;
      const that = this;
      const orguser = _.filter(this.users, f => { return f['orgId'] == orgId; });
      this.operatorList = [];
      _.each(orguser, f => {
        that.operatorList.push({ id: f['id'], name: f['userName'] });
      })
      //that.myOptionsOper = operatorList;
    }
  }
  //选择部门
  onChangeOrg(event) {
    this.onSelectedOrg(event[0]);
  }
  onBack() {
    this._router.navigate(['/pages/store/storeout']);
  }
  //确认入住
  onConfirm(): void {
    if (!this.storeOut.typeId || !this.storeOut.outTimeNg || !this.storeOut.orderNo
      || !this.storeOut.storeId
      || !this.storeOut.orgidNg || !this.storeOut.operator) {
      const msg = "请填写完整。";
      this._state.notifyDataChanged("showMessage.open", { message: msg, type: "warning", time: new Date().getTime() });
      return;
    }
    if (this.selectedGoods.length == 0) {
      const msg = "请选择商品。";
      this._state.notifyDataChanged("showMessage.open", { message: msg, type: "warning", time: new Date().getTime() });
      return;
    }
    this.isSaved = true;
    const that = this;
    this.storeOut.outTime = this._common.getDateString(this.storeOut.outTimeNg);
    this.storeOut.orgid = _.toString(this.storeOut.orgidNg);
    console.log(this.storeOut);
    console.log(this.selectedGoods);
    this._storeoutNewService.create(
      {
        storeout: this.storeOut,
        storeoutList: this.selectedGoods
      }
    ).then(
      function (v) {
        const msg = "保存成功。";
        that._state.notifyDataChanged("showMessage.open", { message: msg, type: "success", time: new Date().getTime() });
        that.isSaved = false;
        that.storeOut.amount = 0;
        that.selectedGoods = [];
        that.isEnable = true;
        that.selectedGrid.load(that.selectedGoods);
        that.getOrderNo();
      },
      (err) => {
        that._state.notifyDataChanged("showMessage.open", { message: err, type: "error", time: new Date().getTime() });
        that.isSaved = false;
      }
      )
  }
}
