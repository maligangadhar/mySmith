import { Component, Input, Output, OnDestroy, ViewChild, TemplateRef, Inject, EventEmitter } from '@angular/core';
import { opMode, messageType, responseStatus, sortOrder } from '../../../models/enums';
import { IKeyValue, IApp, IRoleDetail, IKeyData, IResponse } from '../../../models/viewModels';
import { Subject } from 'rxjs/Subject';
import { ModalCreateRoleComponent } from '../../modal/modal.role.create.component';
import { ICommonService, ISortService, IRoleService, IMessageService, IBroadcastService } from '../../../interfaces/interfaces';

@Component({
  selector: 'sp3-comp-app-usersettings',
  templateUrl: './usersettings.component.html',
  styleUrls: ['./usersettings.component.sass']
})
export class UsersettingsComponent implements OnDestroy {
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
     this.ngUnsubscribe.complete();
 }
  @Input() public controlId: string;
  @Input() public mode: opMode;
  @Input() public cardType: number;
  @Input() public column1Visible: boolean = true;
  @Output() public licenseMessageShow: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('roleViewTemplate') roleViewTemplate: TemplateRef<any>;
  @ViewChild('userViewTemplate') userViewTemplate: TemplateRef<any>;
  @ViewChild('userViewTemplate') appViewTemplate: TemplateRef<any>;
  @ViewChild('generalSettingTemplate') generalSettingTemplate: TemplateRef<any>;
  @ViewChild('roleDetailTemplate') roleDetailTemplate: TemplateRef<any>;
  @ViewChild('userDetailTemplate') userDetailTemplate: TemplateRef<any>;
  @ViewChild('appDetailTemplate') appDetailTemplate: TemplateRef<any>;
  @ViewChild('appTemplate') appTemplate: any;
  @ViewChild('roleTemplate') roleTemplate: any;
  @ViewChild('createUserRoleTemplate') createUserRoleTemplate: any;
  @ViewChild('userHeaderTemplate') userHeaderTemplate: TemplateRef<any>;
  @ViewChild('roleHeaderTemplate') roleHeaderTemplate: TemplateRef<any>;
  @ViewChild('applicationHeaderTemplate') applicationHeaderTemplate: TemplateRef<any>;
  showError: boolean = false;
  @ViewChild(ModalCreateRoleComponent) modal: ModalCreateRoleComponent;
  zIndex0: any = { 'z-index': 4 };
  zIndex1: any = { 'z-index': 3 };
  zIndex2: any = { 'z-index': 2 };
  zIndex3: any = { 'z-index': 1 };
  onCreateRole: () => void;
  getActiveApps: (appList: IApp[]) => IApp[];
  filterList: IKeyValue[] = [];
  selectedFilter: IKeyValue;
  showOptional: boolean;
  showAddNewUserPanel:boolean=false;
  mainTemplate: any;
  detailTemplate: any;
  partsTemplate: any;
  optionalTemplate: any;
  userApplications: IApp[] = [];
  showTemplates: boolean;
  roleDetail: IRoleDetail = { id: 0, name: '', description: '', status: 1, locationId: 0, apps: null, users: null };
  roleApps: IApp[];
  roleUsers: IKeyValue[] = [];
  isRoleSelected: boolean;
  toggleCard: boolean = true;
  ngUnsubscribe:Subject<any> =new Subject<any>();
  isSaveDisabled: boolean = true;
  id: string = 'roleEdit';
  selectedAppsId: string = 'roleEditApps';
  IsSuccess: boolean = false;
  userRoleApps: IApp[] = [];
  createUserRoleApps: IApp[] = [];
  onRoleStatusFilterChange: (selectedValue: IKeyValue) => void;
  bringOnTop: (cardNo: number) => void;
  getSaveButtonEnabled: () => boolean;
  updateRole: () => void;
  handleCardUpdated: (flag: boolean) => void;
  onShowLicenseErrorMessage: (flag: boolean) => void; 
  isNoLicenseMessageShown: boolean = false;
  editMode: string = 'userEdit';
  showadduserpanel:(event) => void;
  innerControlHeight: number = window.innerHeight - 48;
  get IsSaveDisabled(): boolean {
      return this.isSaveDisabled;
  }
  set IsSaveDisabled(value: boolean) {
      this.isSaveDisabled = value;

  }
  constructor( @Inject('ICommonService') private commonService: ICommonService,
  @Inject('IMessageService') private messageService: IMessageService,
  @Inject('IRoleService') private roleService: IRoleService,
  @Inject('ISortService') sortService: ISortService,
  @Inject('IBroadcastService') private broadcastService: IBroadcastService) {
  var vm = this;
  vm.handleCardUpdated = (flag) => {
      vm.toggleCard = flag;
  };

  vm.filterList = [{ id: 0, name: 'All Roles' }, { id: 1, name: 'Active Roles' }, { id: 2, name: 'Inactive Roles' }];
  vm.selectedFilter = vm.filterList[0];

  window.addEventListener('orientationchange', function() {
    vm.innerControlHeight = window.innerHeight - 48;
  });
 vm.showadduserpanel=(event) =>{
    this.showAddNewUserPanel=event;
 };
vm.onShowLicenseErrorMessage=(event) => {
    vm.isNoLicenseMessageShown = event;    
};

  vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
      if (result.key === 'userApps') {
          vm.userRoleApps = result.data;
          vm.broadcastService.broadcast('userApps ', vm.userRoleApps);
      }
      else if (result.key === 'createUserApps') {
          vm.createUserRoleApps = result.data;
          vm.broadcastService.broadcast('selectedUserRoleAppsId', vm.createUserRoleApps);
      }
  });

  vm.updateRole = () => {
      vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };

      if (!vm.roleDetail.description || vm.roleDetail.description.length === 0) {
          vm.messageService.Message = { message: 'EnterRoleDescription', showMessage: true, type: messageType.Error };
      }
      else {
          vm.roleService.updateRole(vm.roleDetail).subscribe(result => {
              if (result.status === responseStatus.Success) {
                  this.commonService.roleModified = true;
                  broadcastService.broadcast('roleFilter', 0);
                  this.commonService.newRole = vm.roleDetail;
                  vm.commonService.NewRoleAdded = true;
                  //this.sharedRole.setRoleDetail(vm.roleDetail);
                  broadcastService.broadcast('roleDetails', vm.roleDetail);
                  vm.broadcastService.broadcast('roleUpdated', null);
                  vm.IsSuccess = true;
                  this.IsSaveDisabled = true;
              }
              else {
                  vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
              }
          },
              (error: IResponse<any>) => {
                  vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
              }
          );
      }
  };
 vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((roleDetail: IKeyData) => {
      if (roleDetail !== null && roleDetail.key === 'roleDetails') {
          vm.IsSuccess = false;
          this.roleDetail = roleDetail.data;
          //filter apps
          this.roleApps = roleDetail.data.apps;// vm.getActiveApps(roleDetail.apps);
          this.roleUsers = roleDetail.data.users;
      }
 });		
  vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((roleFilter: IKeyData) => {
      if (roleFilter !== null && roleFilter.key === 'roleFilter') {
        vm.IsSuccess = false;
        if (vm.selectedFilter.id !== roleFilter.data) {
            vm.selectedFilter = vm.filterList[roleFilter.data];
        }
      }
  });
  vm.onRoleStatusFilterChange = (filterValue: any) => {
      //this.sharedRole.setRoleFilter(filterValue.id);
      broadcastService.broadcast('roleFilter', filterValue.id);
  };
  vm.onCreateRole = () => {
      //this.sharedRole.setRoleFilter(0);
      broadcastService.broadcast('roleFilter',0);
      vm.modal.show();
  };
  vm.bringOnTop = (cardNo: number) => {
      switch (cardNo) {
          case 1:
              vm.zIndex1 = { 'z-index': 3 };
              vm.zIndex2 = { 'z-index': 2 };
              vm.zIndex3 = { 'z-index': 1 };
              break;
          case 2:
              vm.zIndex1 = { 'z-index': 2 };
              vm.zIndex2 = { 'z-index': 3 };
              vm.zIndex3 = { 'z-index': 1 };
              break;
          case 3:
              vm.zIndex1 = { 'z-index': 1 };
              vm.zIndex2 = { 'z-index': 2 };
              vm.zIndex3 = { 'z-index': 3 };
              break;
      }
  };
  vm.getActiveApps = (appsList: IApp[]) => {
      let activeApps: IApp[] = [];
      for (let app in appsList) {
          if (appsList[app].status === 1) {
              activeApps.push(appsList[app]);
          }
      }
      activeApps = sortService.sort(activeApps, 'name', sortOrder.Asc);
      return activeApps;
  };
}

}
