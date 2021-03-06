import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbTabset, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';

import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { NgbdModalContent } from '../../../modal-content.component'
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { SettingService } from './setting.services';
import { HouseTypeService } from '../../market/house-type//house-type.services';
import { GlobalState } from '../../../global.state';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-member-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  providers: [SettingService, HouseTypeService],
})
export class SettingComponent implements OnInit, AfterViewInit {
  loading = false;
  query: string = '';

  settingsCard = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    columns: {
      id: {
        title: 'ID',
        type: 'number',
        editable: false,
        filter: false,
        width: '30px',
      },
      name: {
        title: '会员卡',
        type: 'string',
        filter: false
      },
      level: {
        title: '级别',
        type: 'number',
        filter: false
      },
      cardFee: {
        title: '卡费',
        type: 'number',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      }
    }
  };

  settingsCardUpgrade = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    columns: {
      id: {
        title: 'ID',
        type: 'number',
        editable: false,
        filter: false,
        width: '30px',
      },
      oldCardTxt: {
        title: '旧卡',
        filter: false,
        type: 'string',
      },
      newCardTxt: {
        title: '新卡',
        filter: false,
        type: 'string',
      },
      needInte: {
        title: '升级所需积分',
        type: 'number',
        filter: false
      },
      takeInte: {
        title: '升级消耗积分',
        type: 'number',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      }
    }
  };

  configCard: FieldConfig[] = [
    {
      type: 'input',
      label: '会员卡',
      name: 'name',
      placeholder: '输入会员卡',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '级别',
      name: 'level',
      placeholder: '输入级别',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '卡费',
      name: 'cardFee',
      placeholder: '输入卡费',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  configCardUpgrade: FieldConfig[] = [
    {
      label: '旧卡',
      name: 'oldCard',
      type: 'select',
      placeholder: '请选择',
      options: []
    },
    {
      label: '新卡',
      name: 'newCard',
      type: 'select',
      placeholder: '请选择',
      options: []
    },
    {
      type: 'input',
      label: '升级所需积分',
      name: 'needInte',
      placeholder: '输入升级所需积分',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '升级消耗积分',
      name: 'takeInte',
      placeholder: '输入升级消耗积分',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  sourceCard: LocalDataSource = new LocalDataSource();
  sourceCardUpgrade: LocalDataSource = new LocalDataSource();
  modalConfig: any = {};

  constructor(
    private modalService: NgbModal,
    private memberService: SettingService,
    private houseTypeService: HouseTypeService,
    private _state: GlobalState) {
    this.getDataList('');
  }
  ngOnInit() {
    this.modalConfig.SetCard = this.configCard;
    this.modalConfig.SetCardUpgrade = this.configCardUpgrade;
  }
  ngAfterViewInit() {

  }

  getDataList(modalname): void {
    if (!modalname || modalname == 'SetCard') {
      this.loading = true;
      this.memberService.getMembers('SetCard').then((data) => {
        this.sourceCard.load(data);
        this.loading = false;
        const that = this;
        let cardT2 = _.find(this.configCardUpgrade, function (f) { return f.name == 'oldCard'; });
        let cardT3 = _.find(this.configCardUpgrade, function (f) { return f.name == 'newCard'; });

        _.each(data, function (d) {
          cardT2.options.push({ id: d.id, name: d.name });
          cardT3.options.push({ id: d.id, name: d.name });
        });
      }, (err) => {
        this.loading = false;
        this._state.notifyDataChanged("showMessage.open", { message: err, type: "error", time: new Date().getTime() });
        
      });
    }

    if (!modalname || modalname == 'SetCardUpgrade') {
      this.memberService.getMembers('SetCardUpgrade').then((data) => {
        this.sourceCardUpgrade.load(data);
      });
    }
  }

  onCreate(modalname, title) {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.config = this.modalConfig[modalname];
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.memberService.create(modalname, JSON.parse(result)).then((data) => {
        closeBack();
        const msg = "新增成功。";
        that._state.notifyDataChanged("showMessage.open", { message: msg, type: "success", time: new Date().getTime() });
        that.getDataList(modalname);
      },
        (err) => {
          that._state.notifyDataChanged("showMessage.open", { message: err, type: "error", time: new Date().getTime() });
          
        }
      )
    };
  }

  onEdit(modalname, title, event) {
    console.log(event);
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.config = this.modalConfig[modalname];
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.memberService.update(modalname, event.data.id, JSON.parse(result)).then((data) => {
        closeBack();
        const msg = "新增成功。";
        that._state.notifyDataChanged("showMessage.open", { message: msg, type: "success", time: new Date().getTime() });
        that.getDataList(modalname);
      },
        (err) => {
          that._state.notifyDataChanged("showMessage.open", { message: err, type: "error", time: new Date().getTime() });
          
        }
      )
    };
  }

  //删除
  onDelete(modalname, event) {
    if (window.confirm('你确定要删除吗?')) {
      this.memberService.delete(modalname, event.data.id).then((data) => {
        const msg = "删除成功。";
        this._state.notifyDataChanged("showMessage.open", { message: msg, type: "success", time: new Date().getTime() });
        this.getDataList(modalname);
      }, (err) => {
        this._state.notifyDataChanged("showMessage.open", { message: err, type: "error", time: new Date().getTime() });
        
      });
    }
  }
}
