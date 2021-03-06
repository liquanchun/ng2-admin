import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { HouseTypeService } from './house-type.services';
import { GlobalState } from '../../../global.state';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-house-type',
  templateUrl: './house-type.component.html',
  styleUrls: ['./house-type.component.scss'],
  providers: [HouseTypeService],
})
export class HouseTypeComponent implements OnInit, AfterViewInit {

  loading = false;
  query: string = '';

  settings = {
    mode: 'external',
    hideSubHeader: true,
    actions: {
      columnTitle: '操作'
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
      id: {
        title: 'ID',
        type: 'number',
        editable: false,
        filter: false,
        width: '30px',
      },
      typeName: {
        title: '房型',
        type: 'string',
        filter: false
      },
      allPrice: {
        title: '全价',
        type: 'number',
        filter: false
      },
      startPrice: {
        title: '起步价',
        type: 'number',
        filter: false
      },
      addPrice: {
        title: '单位时间内加价',
        type: 'number',
        filter: false
      },
      addMaxPrice: {
        title: '加价封顶额',
        type: 'number',
        filter: false
      },
      preReceiveFee: {
        title: '预收房费',
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

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '房型',
      name: 'typeName',
      placeholder: '输入房型',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '全价',
      name: 'allPrice',
      placeholder: '输入全价',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '起步价',
      name: 'startPrice',
      placeholder: '输入起步价',
    },
    {
      type: 'input',
      label: '单位时间内加价',
      name: 'addPrice',
      placeholder: '输入单位时间内加价',
    },
    {
      type: 'input',
      label: '加价封顶额',
      name: 'addMaxPrice',
      placeholder: '输入加价封顶额',
    },
    {
      type: 'input',
      label: '预收房费',
      name: 'preReceiveFee',
      placeholder: '输入预收房费',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private modalService: NgbModal,
    private houseTypeService: HouseTypeService,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }
  ngAfterViewInit() {

  }

  getDataList(): void {
    this.loading = true;
    this.houseTypeService.getHouseTypes().then((data) => {
      this.source.load(data);
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("showMessage.open", { message: err, type: "error", time: new Date().getTime() });
      
    });
  }

  newHouse() {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增房型设置';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.houseTypeService.create(JSON.parse(result)).then((data) => {
        closeBack();
        const msg = "新增成功。";
        that._state.notifyDataChanged("showMessage.open", { message: msg, type: "success", time: new Date().getTime() });
        that.getDataList();
      },
        (err) => {
          that._state.notifyDataChanged("showMessage.open", { message: err, type: "error", time: new Date().getTime() });
          
        }
      )
    };
  }

  onEdit(event) {
    console.log(event);
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改房型设置';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.houseTypeService.update(event.data.id, JSON.parse(result)).then((data) => {
        closeBack();
        const msg = "修改成功。";
        that._state.notifyDataChanged("showMessage.open", { message: msg, type: "success", time: new Date().getTime() });
        that.getDataList();
      },
        (err) => {
          that._state.notifyDataChanged("showMessage.open", { message: err, type: "error", time: new Date().getTime() });
          
        }
      )
    };
  }
  //删除
  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      this.houseTypeService.delete(event.data.id).then((data) => {
        const msg = "删除成功。";
        this._state.notifyDataChanged("showMessage.open", { message: msg, type: "success", time: new Date().getTime() });
        this.getDataList();
      }, (err) => {
        this._state.notifyDataChanged("showMessage.open", { message: err, type: "error", time: new Date().getTime() });
        
      });
    }
  }

}
