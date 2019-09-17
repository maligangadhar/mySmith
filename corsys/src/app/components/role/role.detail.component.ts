import { Component, Inject, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { IApp, IRoleDetail, IKeyValue, IKeyData, IResponse, ILocationsDetail } from '../../models/viewModels';
import { IMessageService, IBroadcastService, IDateFormatService, IRoleService, ILocationService, ICommonService, ITranslateService, IGeneralSettings } from '../../interfaces/interfaces';
import { action, responseStatus, roleStatus, messageType, spinnerType, metaDataSettings } from '../../models/enums';
import { SpSelectComponent } from '../../controls/select.control';
import { SpMultiTextboxComponent } from '../../controls/multi.text.control';
import { ModalConfirmComponent } from '../modal/modal.confirm.component';
import { Subject } from 'rxjs/Rx';
@Component({
	selector: 'sp3-comp-role-detail',
	templateUrl: './role.detail.component.html'
})

export class RoleDetailComponent implements OnDestroy, OnInit {
	@ViewChild('modalRoleInactiveAlert') modalRoleInactiveAlert: ModalConfirmComponent;
	@ViewChild(SpSelectComponent) status;
	@ViewChild(SpMultiTextboxComponent) description;
	fetchLocationInfo: () => void;
	locationList: ILocationsDetail[] = [];
	selectedLocation: any;
	statusList: IKeyValue[] = [];
	statusValue: IKeyValue;
	roleStatus: IKeyValue;
	roleCreatedDate: string;
	roleDescription: string;
	roleDetail: IRoleDetail = null;//{ id: null , name: null , description: " Test 1 role", createdDate: null, status: 1, apps: [{ id: 1, name: "app1", logoUrl: '', code: '' }, { id: 2, name: "app2", logoUrl: '', code:'' }], users: [{ id: 1, name: 'U1' }, { id: 2, name: 'U2' }] };
	roleApps: IApp[] = null;
	roleUsers: IKeyValue[] = null;
	IsSuccess: boolean;
	createdatetime: string;

	onTextAdded: (text: string) => void;
	onSelectChanged: (selectedValue: IKeyValue) => void;
	onLocationChanged: (selectedValue: IKeyValue) => void;
	sendData: () => void;
	getSaveButtonDisabled: () => boolean;
	updateRole: () => void;
	cancelUpdateRole: () => void;
	updateRoleClick: () => void;
	yesClick: () => void;
	noClick: () => void;
	setStatusList: () => void;

	ngUnsubscribe: Subject<any> = new Subject<any>();
	isDirty: boolean;
	id: string = 'roleEdit';
	ngOnInit() {
		this.setStatusList();
		this.fetchLocationInfo();
	}
	constructor(
		@Inject('ICommonService') private commonService: ICommonService,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('IRoleService') private roleService: IRoleService,
		@Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('IDateFormatService') private dateFormatService: IDateFormatService,
		@Inject('ITranslateService') public translateService: ITranslateService,
		@Inject('IGeneralSettings') private generalSettingsService: IGeneralSettings,
		@Inject('ILocationService') private locationService: ILocationService) {
		var vm = this;
		vm.setStatusList = () => {
			vm.generalSettingsService.fetchStatusMetaData(metaDataSettings[metaDataSettings.Roles].toString()).subscribe(result => {
			if (result.status === responseStatus.Success) {
				vm.statusList = result.data.RoleStatus;
				vm.roleStatus = vm.statusList[0];
			}
			},
			(error: IResponse<any>) => {					
				vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
			});	
		};
		vm.fetchLocationInfo = (): void => {
			vm.locationService.get().subscribe((result) => {
				vm.locationList = result.data.filter(x => x.status === 2);
				vm.locationList.forEach(item => {
					item.name = item.locationName;
				});

			});
		};
		//vm.statusList = [{ id: 1, name: 'Active' }, { id: 2, name: 'InActive' }];
		//vm.roleStatus = vm.statusList[0];
		vm.selectedLocation = vm.locationList[0];
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((roleDetail: IKeyData) => {
			this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RoleDetailLoading'), showLoader: true, type: spinnerType.small };
			if (roleDetail !== null && roleDetail.key === 'roleSelectionChange') {
				roleDetail.data.createdatetime = roleDetail.data.createdatetime != null ? vm.dateFormatService.formatDate(roleDetail.data.createdatetime, 'MM-DD-YYYY') : roleDetail.data.createdatetime;
				vm.IsSuccess = false;
				vm.roleDetail = roleDetail.data;
				vm.roleApps = roleDetail.data.apps;
				//vm.commonService.ApplicationsList = vm.roleApps;
				vm.broadcastService.broadcast('roleEditApps', vm.roleApps);

				vm.roleDescription = roleDetail.data.description;
				vm.roleUsers = roleDetail.data.users;
				vm.selectedLocation = vm.locationList[vm.locationList.findIndex(x => x.id === roleDetail.data.locationId)];
				if (roleDetail.data.status === 1) {
					vm.roleStatus = vm.statusList[0];
				}
				else {
					vm.roleStatus = vm.statusList[1];
				}
				vm.messageService.resetPageChange();
			} else if (roleDetail.key === 'roleEditAppsAppsChanged') {
				vm.messageService.setPageChange(action.roleEdit, true);
			}
			this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RoleDetailLoading'), showLoader: false, type: spinnerType.small };
		});
		vm.getSaveButtonDisabled = () => {
			if (vm.roleDescription.trim().length !== 0) {
				if (vm.messageService.getPageChange(action.roleEdit)) {
					return false;
				}

				return true;
			}
		};
		vm.onTextAdded = (text: string) => {

			if (vm.roleDescription !== vm.roleDetail.description) {
				vm.isDirty = true;
				vm.messageService.setPageChange(action.roleEdit, true);
			}

			vm.sendData();

			//vm.errorService.Message = { message: "", showMessage: false, type: messageType.Success };
		};

		vm.onSelectChanged = (selectedValue: IKeyValue) => {

			vm.roleStatus = selectedValue;

			if (vm.roleStatus.id !== vm.roleDetail.status) {
				vm.isDirty = true;
				vm.messageService.setPageChange(action.roleEdit, true);
			}

			vm.sendData();
		};

		vm.onLocationChanged = (selectedValue: IKeyValue) => {

			vm.selectedLocation = selectedValue;

			if (vm.selectedLocation !== vm.roleDetail.locationId) {
				vm.isDirty = true;
				vm.messageService.setPageChange(action.roleEdit, true);
			}

			vm.sendData();
		};

		vm.sendData = () => {
			if (vm.isDirty) {
				vm.roleDetail.description = vm.roleDescription;
				vm.roleDetail.status = vm.roleStatus.id;
				vm.roleDetail.locationId = vm.selectedLocation.id;
				//vm.roleDetail.apps = vm.roleApps;
				vm.broadcastService.broadcast(vm.id, vm.roleDetail);
			}
			else {
				vm.broadcastService.broadcast(vm.id, null);
			}
		};

		vm.updateRole = () => {
			this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RolesUpdating'), showLoader: true, type: spinnerType.small };
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			if (!vm.roleDetail.description || vm.roleDetail.description.length === 0) {
				vm.messageService.Message = { message: 'EnterRoleDescription', showMessage: true, type: messageType.Error };
			}
			else {
				vm.roleService.updateRole(vm.roleDetail).subscribe(result => {
					if (result.status === responseStatus.Success) {
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RolesUpdating'), showLoader: false, type: spinnerType.small };
						vm.messageService.resetPageChange();
						vm.commonService.roleModified = true;
						//vm.sharedRole.setRoleFilter(0);
						vm.commonService.newRole = vm.roleDetail;
						vm.commonService.NewRoleAdded = true;
						//vm.sharedRole.setRoleDetail(vm.roleDetail);
						broadcastService.broadcast('roleSelectionChange', vm.roleDetail);
						vm.broadcastService.broadcast('roleUpdated', null);
						vm.IsSuccess = true;
					}
					else {
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RolesUpdating'), showLoader: false, type: spinnerType.small };
						vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
					}
				},
					(error: IResponse<any>) => {
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RolesUpdating'), showLoader: false, type: spinnerType.small };
						vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
					}
				);
			}
		};

		vm.updateRoleClick = () => {
			vm.IsSuccess = false;
			if (vm.roleDetail.status === roleStatus.InActive && vm.roleDetail.users.length > 0) {
				vm.modalRoleInactiveAlert.show();
				return;
			}
			vm.updateRole();
		};
		vm.yesClick = () => {
			vm.modalRoleInactiveAlert.hide();
			vm.updateRole();
		};

		vm.noClick = () => {
			vm.modalRoleInactiveAlert.hide();
		};
		vm.cancelUpdateRole = () => {
			if (vm.messageService.showLeaveMessage(action.roleEditCancelClick)) {
				this.messageService.LeaveMessage = { key: 'Roles', showMessage: true, type: action.roleEditCancelClick };
			}
			else {
				//this.sharedRole.IsCancelled = true;
				broadcastService.broadcast('IsCancelled', true);
				broadcastService.broadcast('roleCancelled', true);
			}
		};

	}
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

}
