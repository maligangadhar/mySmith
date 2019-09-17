import { Component, ViewChild, Inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ICommonService, IRoleService, IApplicationService, ITranslateService, IMessageService, IBroadcastService, ILocationService } from '../../interfaces/interfaces';
import { IResponse, IRole, IApp, IRoleDetail, IKeyValue, IKeyData, ILocationsDetail } from '../../models/viewModels';
import { responseStatus, messageType, spinnerType } from '../../models/enums';
import { SpSelectComponent } from '../../controls/select.control';
import { SpTextboxComponent } from '../../controls/textbox.control';
import { SpMultiTextboxComponent } from '../../controls/multi.text.control';
import { ModalConfirmComponent } from '../modal/modal.confirm.component';
import { Subject } from 'rxjs/Rx';
@Component({
	selector: 'sp3-comp-modal-create-role',
	templateUrl: './modal.role.create.component.html'
})

export class ModalCreateRoleComponent implements OnInit, OnDestroy {
	@ViewChild(SpSelectComponent) status;
	@ViewChild(SpMultiTextboxComponent) description;
	@ViewChild(SpTextboxComponent) name;

	@ViewChild('modalClose') modalClose: ModalConfirmComponent;
	@ViewChild('modalAppAlert') modalAppAlert: ModalConfirmComponent;
	
	@Output() showUpdateRole: EventEmitter<boolean> = new EventEmitter();

	public visible = false;
	public visibleAnimate = false;
	roleName: string;
	roleDescription: string;
	fetchLocationInfo:  () => void;
	locationList: ILocationsDetail[]= []; 
	roleStatus: IKeyValue;
	applicationsList: IApp[] = [];
	roleSelectedApps: IApp[] = [];
	createRoleDetails: IRoleDetail = { id: 0, name: '', description: '', status: 1, locationId: 0, apps: [], users: [] };
	createdRole: IRoleDetail = { id: -1, name: '', status: -1, apps: null, users: null, description: '', locationId: -1, };
	roleList: IRole[] = [];
	statusList: IKeyValue[] = [];
	statusValue: IKeyValue;
	isCreateEnable: boolean;
	isDirty: boolean;
	id: string = 'roleCreate';
	selectedLocation: any;
	createRoleClick: () => void;
	saveRole: () => void;
	getApplicationsAndRoles: () => void;
	reset: () => void;
	closeClick: () => void;
	leaveClick: () => void;
	backClick: () => void;
	yesClick: () => void;
	noClick: () => void;
	show: () => void;
	hide: () => void;
	ngUnsubscribe: Subject<any> = new Subject<any>();
	GetCreateButtonEnabled: () => boolean;
	GetSelectedAppsCount: () => number;
	onTextAdded: (text: string) => void;
	onSelectChanged: (selectedValue: IKeyValue) => void;

	constructor( @Inject('IApplicationService') private appService: IApplicationService, @Inject('IRoleService') private roleService: IRoleService,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('ICommonService') private commonService: ICommonService, @Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('ITranslateService') public translateService: ITranslateService, 
		@Inject('ILocationService') private locationService: ILocationService) {
		var vm = this;

		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			if (result.key === vm.id + 'AppsChanged') {
				vm.roleSelectedApps = result.data;
				vm.isDirty = true;
			}
		});
		vm.fetchLocationInfo = (): void => {
			vm.locationService.get().subscribe( (result) => {
				vm.locationList = result.data.filter(x => x.status === 2);	
				vm.locationList.forEach(item => {
				  item.name=item.locationName;
				});
				vm.selectedLocation=vm.locationList[0];
			});
		};
	
		vm.reset = () => {
			vm.isCreateEnable = false;
			vm.isDirty = false;
			vm.createRoleDetails = { id: 0, name: '', description: '', status: 1, apps: [], locationId: 0, users: [] };
			vm.statusList = [{ id: 1, name: 'Active' }, { id: 2, name: 'InActive' }];
			vm.roleName = '';
			vm.roleStatus = vm.statusList[0];
			//vm.selectedLocation = vm.locationList[0];
			vm.roleDescription = '';
			vm.roleSelectedApps = [];
		};

		vm.getApplicationsAndRoles = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };

			vm.appService.getApplications().subscribe(result => {
				if (result.status === responseStatus.Success) {
					vm.applicationsList = result.data;
					vm.broadcastService.broadcast(vm.id, result.data);
				}
				else {
					vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
				}
			},
				(error: IResponse<any>) => {
					vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				}
			);
		};

		vm.createRoleClick = () => {
			if (vm.roleSelectedApps.length === 0) {
				vm.modalAppAlert.show();
				return;
			}
			this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RolesSaving'), showLoader: true, type: spinnerType.small };
			vm.saveRole();
			//vm.showUpdateRole.emit(false);
			//console.log('Done');
		};

		vm.saveRole = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			vm.createRoleDetails.apps = vm.roleSelectedApps;
			vm.createRoleDetails.status = vm.roleStatus.id;
			vm.createRoleDetails.locationId = vm.selectedLocation.id;
			vm.createRoleDetails.name = vm.roleName;
			vm.createRoleDetails.description = vm.roleDescription;
			if (!vm.createRoleDetails.name || vm.createRoleDetails.name.length === 0) {
				vm.messageService.Message = { message: 'EnterRoleName', showMessage: true, type: messageType.Error };
			}
			else if (vm.checkDuplicateRole(vm.createRoleDetails.name, vm.commonService.RolesList)) {
				vm.messageService.Message = { message: translateService.instant('RoleExists', vm.roleName), showMessage: true, type: messageType.Error };
			}
			else if (!vm.createRoleDetails.description || vm.createRoleDetails.description.length === 0) {
				vm.messageService.Message = { message: 'EnterRoleDescription', showMessage: true, type: messageType.Error };
			}
			else {
				vm.roleService.createRole(vm.createRoleDetails).subscribe(result => {
					if (result.status === responseStatus.Success) {
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage:vm.translateService.instant('RolesSaving'), showLoader: false, type: spinnerType.small };
						vm.createdRole = result.data;
						//this.sharedRole.setRoleDetail(vm.createdRole);
						broadcastService.broadcast('roleDetails', vm.createdRole);
						this.commonService.newRole = vm.createdRole;
						vm.commonService.NewRoleAdded = true;
						vm.reset();
						broadcastService.broadcast('roleSelectionChange', vm.createdRole);
						vm.hide();
						vm.showUpdateRole.emit(false);						
					}
					else {
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage:vm.translateService.instant('RolesSaving'), showLoader: false, type: spinnerType.small };
						vm.commonService.NewRoleAdded = false;
						vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
					}
				},
					(error: IResponse<any>) => {
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage:vm.translateService.instant('RolesSaving'), showLoader: false, type: spinnerType.small };
						vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
					}
				);
			}
		};

		vm.GetSelectedAppsCount = () => {
			if (vm.roleSelectedApps.length > 0) {
				vm.isDirty = true;
			}

			return vm.roleSelectedApps.length;
		};

		vm.GetCreateButtonEnabled = () => {
			return !vm.isCreateEnable;
		};

		vm.onTextAdded = (text: string) => {
			vm.isCreateEnable = false;
			vm.isDirty = true;
			if (vm.roleName.trim().length !== 0 && vm.roleDescription.trim().length !== 0) {
				vm.isCreateEnable = true;
			}

			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
		};

		vm.onSelectChanged = (selectedValue: IKeyValue) => {
			vm.isDirty = true;
		};

		vm.closeClick = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };

			if (vm.isDirty) {
				vm.modalClose.show();
				vm.showUpdateRole.emit(false);
			}
			else {
				vm.reset();
				vm.hide();
				vm.showUpdateRole.emit(false);
			}
		};

		vm.leaveClick = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };

			vm.modalClose.hide();
			vm.reset();
			vm.hide();
		};

		vm.backClick = () => {

			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };

			vm.modalClose.hide();
		};

		vm.yesClick = () => {
			vm.modalAppAlert.hide();
			vm.saveRole();
		};

		vm.noClick = () => {
			vm.modalAppAlert.hide();
		};

		vm.show = () => {
			this.visible = true;
			setTimeout(() => this.visibleAnimate = true);
		};

		vm.hide = () => {
			this.visibleAnimate = false;
			setTimeout(() => this.visible = false, 300);
		};
	}

	checkDuplicateRole = (name: string, roles: IRole[]) => {
		for (var index in roles) {
			if (name.toLowerCase() === roles[index].name.toLowerCase()) {
				return true;
			}
		}
		return false;
	}
	ngOnInit() {
		this.reset();
		this.getApplicationsAndRoles();
		this.fetchLocationInfo();
	}
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
} 
