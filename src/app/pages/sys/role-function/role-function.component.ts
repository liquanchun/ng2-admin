
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { DynamicFormComponent } from '../../../theme/components/dynamic-form/containers/dynamic-form/dynamic-form.component';

import { RoleComponent } from '../components/role/role.component';
import { UserComponent } from '../components/user/user.component';
import { OrgComponent } from '../components/org/org.component';

import * as $ from 'jquery';
@Component({
  selector: 'app-role-function',
  templateUrl: './role-function.component.html',
  styleUrls: ['./role-function.component.scss'],
})
export class RoleFunctionComponent implements OnInit, AfterViewInit {

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  sportName: string;
  sportNameObj: any;

  config: FieldConfig[] = [
    {
      type: 'input',
      label: 'Full name',
      name: 'name',
      placeholder: 'Enter your name',
      validation: [Validators.required, Validators.minLength(4)],
    },
    {
      type: 'select',
      label: 'Favourite Food',
      name: 'food',
      options: ['Pizza', 'Hot Dogs', 'Knakworstje', 'Coffee'],
      placeholder: 'Select an option',
      validation: [Validators.required],
    },
    {
      type: 'multiselect',
      label: 'Favourite Food',
      name: 'foodmulti',
      options: [
        { id: 1, name: 'Car brands' },
        { id: 2, name: 'Volvo' },
        { id: 3, name: 'Honda' },
        { id: 4, name: 'BMW' },
        { id: 5, name: 'Colors' },
        { id: 6, name: 'Blue' },
        { id: 7, name: 'Red' },
        { id: 8, name: 'White' }
      ],
      placeholder: 'Select an option',
      validation: [Validators.required],
    },
    {
      type: 'datepicker',
      label: '开始日期',
      name: 'startdate',
    },
    {
      type: 'check',
      label: '学位',
      name: 'book',
      check: 'checkbox',
      options: [
        { id: 1, name: '博士' },
        { id: 2, name: '硕士' },
        { id: 3, name: '本科' },
      ]
    },
    {
      label: '保存',
      name: 'submit',
      type: 'button',
      callback: function () {
        console.log('back');
      },
    },
  ];

  constructor() {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    let previousValid = this.form.valid;
    this.form.changes.subscribe(() => {
      if (this.form.valid !== previousValid) {
        previousValid = this.form.valid;
        this.form.setDisabled('submit', !previousValid);
      }
    });

    this.form.setDisabled('submit', true);
    this.form.setValue('name', 'Todd Motto');
    this.form.setValue('food', 'Knakworstje');
    this.form.setValue('foodmulti', [2]);
    this.form.setValue('startdate', { "year": 2017, "month": 7, "day": 14 });
    this.form.setValue('book', '2');
  }

  submit(value: { [name: string]: any }) {
    console.log(value);
  }

  backTop() {
    console.log('back');
  }
}
