import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { TreeNode, TreeModel, TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions } from 'angular-tree-component';
import { DicService } from './dic.services';
import { GlobalState } from '../../../global.state';

import * as $ from 'jquery';
import * as _ from 'lodash';

const actionMapping: IActionMapping = {
  mouse: {
    contextMenu: (tree, node, $event) => {
      $event.preventDefault();
      alert(`context menu for ${node.data.name}`);
    },
    dblClick: (tree, node, $event) => {
      if (node.hasChildren) TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
    },
    click: (tree, node, $event) => {
      $event.shiftKey
        ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(tree, node, $event)
        : TREE_ACTIONS.TOGGLE_SELECTED(tree, node, $event);
    },
  },
  keys: {
    [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.name}`),
  },
};

@Component({
  selector: 'app-sys-dic',
  templateUrl: './dic.component.html',
  styleUrls: ['./dic.component.scss'],
  providers: [DicService],
})
export class DicComponent implements OnInit, AfterViewInit {

  private isNewDic: boolean;

  private selectedDic: any;

  private newDicName: string;

  nodes = [
    {
      id: 1,
      name: 'root1',
      isExpanded: true,
      children: [
        {
          id: 2,
          name: 'child1'
        }, {
          id: 3,
          name: 'child2'
        }
      ]
    }
  ];

  customTemplateStringOptions: ITreeOptions = {
    // displayField: 'subTitle',
    isExpandedField: 'expanded',
    idField: 'uuid',
    //getChildren: this.getChildren.bind(this),
    actionMapping,
    nodeHeight: 23,
    allowDrag: (node) => {
      // console.log('allowDrag?');
      return true;
    },
    allowDrop: (node) => {
      // console.log('allowDrop?');
      return true;
    },
    useVirtualScroll: true,
    animateExpand: true,
    animateSpeed: 30,
    animateAcceleration: 1.2,
  };

  constructor(private modalService: NgbModal,
    fb: FormBuilder,
    private dicService: DicService,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.isNewDic = true;
    this.getNodes();
  }
  ngAfterViewInit() {

  }

  getNodes() {
    const that = this;
    this.dicService.getDics(function (dics) {
      console.log(dics);
      that.nodes = dics;
    });
  }

  onInitialized(tree) {
    tree.treeModel.expandAll();
  }

  onEvent(event) {
    if (event.eventName === 'focus') {
      this.selectedDic = event.node;
    }
    console.log(event);
  }

  onSaveDic(tree) {
    const that = this;
    this.isNewDic = !this.isNewDic;
    if (this.isNewDic) {
      if (this.newDicName) {
        // TODO
        const focusNode = tree.treeModel.getFocusedNode();
        if (focusNode) {
          this.dicService
            .create(focusNode.data.id, this.newDicName)
            .then(function (role) {
              that.getNodes();
              that.newDicName = '';
            }, (err) => {
              alert(`保存失败。${err}`);
            });
        } else {
          alert('请选择父节点。');
        }
      } else {
        alert('子节点名称不能为空。');
      }
    }
  }
  // 删除选择的角色
  onDeleteDic(tree) {
    const focusNode = tree.treeModel.getFocusedNode();
    if (focusNode) {
      if (focusNode.data.children.length > 0) {
        alert('选择的节点有子节点，不能删除。');
      } else {
        const that = this;
        const confirm = {
          message: `${focusNode.data.name}节点`,
          callback: () => {
            that.dicService.delete(focusNode.data.id).then(() => {
              that.getNodes();
              that.selectedDic = null;
            });
          },
        };
        that._state.notifyDataChanged('delete.confirm', confirm);
      }
    } else {
      alert('请选择你要删除的子节点。');
    }
  }
}