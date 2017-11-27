import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import {NgbdModalContent} from '../../../modal-content.component'
  
import { SendrecordService } from './sendrecord.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-sendrecord',
  templateUrl: './sendrecord.component.html',
  styleUrls: ['./sendrecord.component.scss'],
  providers: [SendrecordService],
})
export class SendrecordComponent implements OnInit, AfterViewInit {

  title = '发送记录';
  query: string = '';

  settings = {
    mode: 'external',
    selectMode: 'multi',
    actions: {
      columnTitle: '操作'
    },
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      saveButtonContent: '<i class="ion-checkmark"></i>',
      cancelButtonContent: '<i class="ion-close"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    hideSubHeader: true,
    columns: {
      id: {
        title: 'ID',
        type: 'number',
        editable: false,
        filter: false,
        width: '30px',
      },
      code: {
        title: '发送时间',
        type: 'string',
        filter: false,
        width: '80px',
      },
      floor: {
        title: '业务',
        type: 'string',
        filter: false,
        width: '80px',
      },
      houseType: {
        title: '手机号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      tags: {
        title: '内容',
        type: 'string',
        filter: false,
        width: '80px',
      },
      state: {
        title: '状态',
        type: 'string',
        filter: false,
        width: '80px',
      },
    }
  };

  config: FieldConfig[] = [
    {
      type: 'select',
      label: '楼层',
      name: 'floor',
      options: ['6楼', '7楼', '8楼'],
      placeholder: '选择楼层',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '房间编号',
      name: 'code',
      placeholder: '输入房间编号',
      validation: [Validators.required],
    },
    {
      type: 'check',
      label: '房间类型',
      name: 'houseType',
      check: 'radio',
      options: [
        { id: '标准房', name: '标准房' },
        { id: '豪华单间', name: '豪华单间' },
      ]
    },
    {
      type: 'input',
      label: '房间特征',
      name: 'tags',
      placeholder: '输入房间特征',
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
    private sendrecordService: SendrecordService,
    private _common: Common,
    private _state: GlobalState) {
    this.getDataList();
  }
  ngOnInit() {

  }
  ngAfterViewInit() {

  }
  onPageChange(p) {
    console.log("page:" + p);
  }
  onCreate() {

  }
  openModal(id: string){
    this.modalService.open(id);
  }

  newHouse() {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增房间信息';
    modalRef.componentInstance.config = this.config;
    modalRef.result.then((result) => {
        if (result !== 'no') {
          console.log(result);
          result.state = '空净';
          that.sendrecordService.create(JSON.parse(result)).then(
            function (v) {
              that.getDataList();
            },
            (err) => { 
               alert(err);
            }
          )
        }
      }, (reason) => {
      });
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'code', search: query },
      { field: 'tags', search: query },
      { field: 'state', search: query },
    ], false);
  }

  onEdit(event) {
    console.log(event);
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改房间信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.formValue = event.data;
    modalRef.result.then((result) => {
        if (result !== 'no') {
          console.log(result);
          that.sendrecordService.update(event.data.id,JSON.parse(result)).then(
            function (v) {
              that.getDataList();
            },
            (err) => { }
          )
        }
      }, (reason) => {
      });
  }
  //删除
  onDelete(event){
    if (window.confirm('你确定要删除吗?')) {
      this.sendrecordService.delete(event.data.id).then((data) => {
        this.getDataList();
      });
    }
  }

  getDataList(): void {
    this.sendrecordService.getSendrecords().then((data) => {
      this.source.load(data);
    });
  }
}
