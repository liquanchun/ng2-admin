import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { TreeNode, TreeModel, TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions } from 'angular-tree-component';
import { MenuService } from './menu.services';
import { GlobalState } from '../../../../global.state';

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
  selector: 'app-sys-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: [MenuService],
})
export class MenuComponent implements OnInit, AfterViewInit {

  private isNewMenu: boolean;

  private selectedMenu: any;

  private newMenuName: string;

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
    private menuService: MenuService,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.isNewMenu = true;
    this.getNodes();
  }
  ngAfterViewInit() {

  }

  getNodes() {
    const that = this;
    this.menuService.getMenus(function (menus) {
      console.log(menus);
      that.nodes = menus;
    });
  }

  onInitialized(tree) {
    tree.treeModel.expandAll();
  }

  onEvent(event) {
    if (event.eventName === 'focus') {
      this.selectedMenu = event.node;
    }
    console.log(event);
  }

  onSaveMenu(tree) {
    const that = this;
    this.isNewMenu = !this.isNewMenu;
    if (this.isNewMenu) {
      if (this.newMenuName) {
        // TODO
        const focusNode = tree.treeModel.getFocusedNode();
        if (focusNode) {
          this.menuService
            .create(focusNode.data.id, this.newMenuName)
            .then(function (role) {
              that.getNodes();
              that.newMenuName = '';
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
  onDeleteMenu(tree) {
    const focusNode = tree.treeModel.getFocusedNode();
    if (focusNode) {
      if (focusNode.data.children.length > 0) {
        alert('选择的节点有子节点，不能删除。');
      } else {
        const that = this;
        const confirm = {
          message: `${focusNode.data.name}节点`,
          callback: () => {
            that.menuService.delete(focusNode.data.id).then(() => {
              that.getNodes();
              that.selectedMenu = null;
            });
          },
        };
        that._state.notifyDataChanged('delete.confirm', confirm);
      }
    } else {
      alert('请选择你要删除的子节点。');
    }
  }

  getNode(nodeArr: any, name: string) {
    let findNode: any = {};
    _.each(nodeArr, (f) => {
      if (f.name === name) {
        findNode = f;
      }
      if (f.children) {
        return this.getNode(f.children, name);
      }
    });

    return findNode;
  }
}
