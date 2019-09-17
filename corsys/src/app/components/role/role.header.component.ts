import { Component, Inject, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { IKeyValue, IRoleDetail, IApp, IKeyData } from '../../models/viewModels';
import { IMessageService, IBroadcastService, ITranslateService } from '../../interfaces/interfaces';
import { action, page } from '../../models/enums';
import { ModalCreateRoleComponent } from '../modal/modal.role.create.component';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Rx';
@Component({
	selector: 'sp3-comp-role-header',
	templateUrl: './role.header.component.html'
})

export class RoleHeaderComponent implements OnDestroy {

	@ViewChild(ModalCreateRoleComponent) modal: ModalCreateRoleComponent;
	createRole: () => void;

	//@ViewChild('modalRoleInactiveAlert') modalRoleInactiveAlert: ModalConfirmComponent;

	onRoleStatusFilterChange: (selectedValue: IKeyValue) => void;
	filterList: IKeyValue[] = [];
	selectedFilter: IKeyValue;
	oldFilter: IKeyValue;
	selectedValueFilter: IKeyValue;
	IsSuccess: boolean;
	IsSaveDisabled: boolean;
	@Output() showUpdateRole: EventEmitter<boolean> = new EventEmitter();
	roleDetail: IRoleDetail = { id: 0, name: '', description: '', status: 1, locationId: 0, apps: [], users: [] };
	roleApps: IApp[];
	roleUsers: IKeyValue[] = [];
	id: string = 'roleEdit';
	selectedAppsId: string = 'roleEditApps';
	isRoleSelected: boolean;
	isCancelDisabled: boolean;
	onCreateRole: () => void;
	updateRole: () => void;
	cancelUpdateRole: () => void;
	updateRoleClick: () => void;
	yesClick: () => void;
	noClick: () => void;
	ngUnsubscribe: Subject<any> = new Subject<any>();
	searchFormControl = new FormControl();
	constructor(@Inject('IMessageService') private messageService: IMessageService, 
		@Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('ITranslateService') public translateService: ITranslateService) {
		var vm = this;
		vm.searchFormControl.valueChanges.debounceTime(400)
			.subscribe((newValue: string) => {
				vm.broadcastService.broadcast('roleSearchPublish', { 'eventMessage': newValue });
			});

				
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe(eventMessage => {
			if (eventMessage.key === page.role.toString()) {
				vm.searchFormControl.patchValue('', { emitEvent: false });
				vm.broadcastService.broadcast('roleSearchPublish', { 'eventMessage': '' });
			}
		});

		vm.filterList = [{ id: 0, name: vm.translateService.instant('AllRoles') }, { id: 1, name: vm.translateService.instant('ActiveRoles') }, { id: 2, name: vm.translateService.instant('InactiveRoles') }];
		vm.selectedFilter = vm.filterList[0];
		vm.oldFilter = vm.selectedFilter;
		vm.IsSaveDisabled = true;
		vm.isCancelDisabled = false;
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((roleFilter: IKeyData) => {
			if (roleFilter !== null && roleFilter.key === 'roleFilter') {
				vm.IsSuccess = false;
				if (vm.selectedFilter.id !== roleFilter.data) {
					vm.selectedFilter = vm.filterList[roleFilter.data];
				}
			}
		});
		vm.messageService.OperationGoAhead.subscribe(item => {
			if (item && item.operationAllowed && item.from === action.roleEditCancelClick) {
				//vm.sharedRole.IsCancelled = true;
				broadcastService.broadcast('IsCancelled', true);
				broadcastService.broadcast('roleCancelled', true);
				this.messageService.resetPageChange();
			}
			else {
				broadcastService.broadcast('IsCancelled', false);
				broadcastService.broadcast('roleCancelled', false);
			}
		});

		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			vm.IsSuccess = false;
			if (result.key === vm.id) {
				if (result.data != null) {
					this.roleDetail = result.data;
					this.roleApps = result.data.apps;
					this.roleUsers = result.data.users;
					vm.isRoleSelected = true;
					this.IsSaveDisabled = false;
					this.isCancelDisabled = false;
				}
				else {
					this.IsSaveDisabled = true;
					this.isCancelDisabled = false;
				}
			}

			if (result.key === 'roleAppsChanged') {
				vm.messageService.setPageChange(action.roleEdit, true);

				vm.roleApps = result.data;
				vm.isRoleSelected = true;
				this.IsSaveDisabled = false;
				this.isCancelDisabled = false;
			}
		});



		vm.onRoleStatusFilterChange = (selectedValue: IKeyValue) => {
			vm.selectedValueFilter = selectedValue;

			if (this.messageService.showLeaveMessage(action.roleChange)) {
				broadcastService.broadcast('IsFilterChanged', true);
				this.messageService.LeaveMessage = { key: 'Roles', showMessage: true, type: action.roleChange };
			}
			else {
				vm.broadcastService.broadcast('filterChange', null);
				//vm.sharedRole.setRoleFilter(vm.selectedValueFilter.id);
				broadcastService.broadcast('roleFilter', vm.selectedValueFilter.id);
				vm.oldFilter = vm.selectedValueFilter;
			}

		};
		this.messageService.OperationGoAhead.subscribe(item => {
			vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((sharedRole: IKeyData) => {
				if (sharedRole !== null && sharedRole.key === 'IsFilterChanged') {
					if (item.operationAllowed && sharedRole.data) {
						vm.broadcastService.broadcast('filterChange', null);
						//vm.sharedRole.setRoleFilter(vm.selectedValueFilter.id);
						broadcastService.broadcast('roleFilter', vm.selectedValueFilter.id);
						vm.oldFilter = vm.selectedValueFilter;
						broadcastService.broadcast('IsFilterChanged', false);
					}
					else {
						vm.selectedFilter = vm.oldFilter;
					}
				}
			});

		});

		vm.onCreateRole = () => {
			if (this.messageService.showLeaveMessage(action.roleAddButtonClick)) {
				this.messageService.LeaveMessage = { key: 'Roles', showMessage: true, type: action.roleAddButtonClick };
			}
			else {
				vm.createRole();
			}
		};
		vm.onCreateRole=()=>{
			this.showUpdateRole.emit(true);
		};
		vm.createRole = () => {
			broadcastService.broadcast('roleFilter', 0);
			vm.modal.show();
		};
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((roleDetail: IKeyData) => {
			if (roleDetail !== null && roleDetail.key === 'roleSelectionChange') {
				vm.IsSuccess = false;
				this.roleDetail = roleDetail.data;
				this.roleApps = roleDetail.data.apps;
				this.roleUsers = roleDetail.data.users;
			} else {
				// this.roleDetail = null;
				this.isCancelDisabled = true;
			}
		});
	}
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
