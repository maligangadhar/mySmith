import { Component, Inject, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import {  IKeyValue, IUserDetail, IRole, IKeyData } from '../../models/viewModels';
import { IMessageService, IBroadcastService, ITranslateService } from '../../interfaces/interfaces';
import { ModalCreateUserComponent } from '../modal/modal.user.create.component';
import { ModalConfirmComponent } from '../modal/modal.confirm.component';
import { page, action } from '../../models/enums';
import { Subject } from 'rxjs/Rx';
@Component({
	selector: 'sp3-comp-user-header',
	templateUrl: './user.header.component.html'
})

export class UserHeaderComponent implements OnDestroy {

	@ViewChild(ModalCreateUserComponent) modalCreate: ModalCreateUserComponent;
	@ViewChild('modalRoleAlert') modalRoleAlert: ModalConfirmComponent;

	filterList: IKeyValue[] = [];
	selectedFilter: IKeyValue;
	oldSelectedFilter: IKeyValue;
	@Output() showUpdateUSer: EventEmitter<boolean> = new EventEmitter();
	@Output() showLicenseErrorMessage: EventEmitter<boolean> = new EventEmitter();
	IsSuccess: boolean;
	IsSaveDisabled: boolean;
	IsCancelDisabled: boolean;
	isEmailInvalid: boolean = false;
	id: string = 'userEdit';
	searchString: string;
	addNewUserPanel: boolean = false;
	userDetail: IUserDetail =
	{
		id: 0,
		userName: '',
		fullName: '',
		email: '',
		telephone: '',
		mobile: '',
		status: 2,
		employementStatus: '',
		position: '',
		createDate: null,
		createdBy: '',
		modifiedDate: null,
		modifiedBy: '',
		roles: null,
		assignedLicense: false,
    locations:'',
    locationcode:''    
	};
	userRoles: IRole[];
	searchFormControl = new FormControl();
	ngUnsubscribe: Subject<any> = new Subject<any>();
	onUserStatusFilterChange: (selectedValue: IKeyValue) => void;
	createUser: () => void;
	onCreateUser: () => void;
	updateUser: () => void;
	updateUserClick: () => void;
	cancelUpdateUser: () => void;	
	yesClick: () => void;
	noClick: () => void;

	constructor( @Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('ITranslateService') public translateService: ITranslateService) {
		var vm = this;

		vm.searchFormControl.valueChanges.debounceTime(400).subscribe((newValue: string) => {
			if (this.messageService.showLeaveMessage(action.userSearch)) {
				vm.searchString = newValue;
				this.messageService.LeaveMessage = { key: 'Users', showMessage: true, type: action.userSearch };
			}
			else {
				vm.broadcastService.broadcast('userSearchPublish', { 'eventMessage': newValue });
			}
		});

		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe(eventMessage => {
			if (eventMessage.key === page.user.toString()) {
				vm.searchFormControl.patchValue('', { emitEvent: false });
				vm.broadcastService.broadcast('userSearchPublish', { 'eventMessage': '' });
			}
		});

		vm.filterList = [{ id: 0, name:  vm.translateService.instant('AllUsers') }, { id: 1, name: vm.translateService.instant('ActiveUsers') }, { id: 2, name: vm.translateService.instant('InactiveUsers') }];
		vm.selectedFilter = vm.filterList[0];
		vm.oldSelectedFilter = vm.selectedFilter;

		vm.onUserStatusFilterChange = (selectedValue: IKeyValue) => {
			if (this.messageService.showLeaveMessage(action.userFilterChange)) {
				this.messageService.LeaveMessage = { key: 'Users', showMessage: true, type: action.userFilterChange };
			}
			else {
				vm.oldSelectedFilter = selectedValue;
				vm.broadcastService.broadcast('filterChange', null);
				vm.broadcastService.broadcast('userFilter', selectedValue.id);
			}
		};

		vm.messageService.OperationGoAhead.subscribe(item => {
			if (item && item.operationAllowed && item.from === action.userAddButtonClick) {
				this.messageService.resetPageChange();
				vm.createUser();
			}
			else if (item && item.operationAllowed && item.from === action.userEditCancelClick) {
				this.broadcastService.broadcast('EditUserCancelled', true);
			}

			if (item && item.operationAllowed && item.from === action.userFilterChange) {
				this.messageService.resetPageChange();
				vm.broadcastService.broadcast('filterChange', null);
				vm.oldSelectedFilter = vm.selectedFilter;
				vm.broadcastService.broadcast('userFilter', vm.selectedFilter.id);

			}
			else if (item && item.from === action.userFilterChange) {
				vm.broadcastService.broadcast('filterChange', null);
				vm.broadcastService.broadcast('canceluserFilter', vm.oldSelectedFilter.id);
			}

			if (item && item.operationAllowed && item.from === action.userSearch) {
				this.messageService.resetPageChange();
				vm.broadcastService.broadcast('userSearchPublish', { 'eventMessage': vm.searchString });
			}
			else if (item && item.from === action.userSearch) {
				{
					vm.searchFormControl.patchValue('', { emitEvent: false });
					vm.broadcastService.broadcast('userSearchPublish', { 'eventMessage': '' });
					vm.broadcastService.broadcast('cancelUserSearch', true);
				}
			}
		});
        vm.onCreateUser=()=>{
			this.showUpdateUSer.emit(true);
		};
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			vm.IsSuccess = false;
			if (result.key === vm.id) {
				if (result.data != null) {
					this.userDetail = result.data;
					this.userRoles = this.userDetail.roles;
				}			
				this.IsCancelDisabled = false;
			}
			else if (result.key === 'editUserEmailInput') {
				vm.isEmailInvalid = result.data;				
				this.IsCancelDisabled = false;
			}
			else if (result.key === 'userView') {
				this.IsSaveDisabled = true;
				this.IsCancelDisabled = true;
				var userDetail = result.data;
				if (userDetail !== null) {
					vm.IsSuccess = false;
					this.IsCancelDisabled = false;
					this.userDetail = userDetail;
					this.userRoles = userDetail.roles;
				}
				else {
					this.userDetail = null;
				}
			}
			else if (result.key === 'userFilter') {
				var userFilter = result.data;
				if (vm.selectedFilter.id !== userFilter) {
					vm.selectedFilter = vm.filterList[userFilter];
					vm.oldSelectedFilter = vm.selectedFilter;
				}
			}
			else if (result.key === 'canceluserFilter') {
				var userFilterInfo = result.data;
				if (vm.selectedFilter.id !== userFilterInfo) {
					vm.selectedFilter = vm.filterList[userFilterInfo];
					vm.oldSelectedFilter = vm.selectedFilter;
				}
			}
			else if (result.key === 'createUserCancelled' || result.key === 'createdNewUser') {
				vm.selectedFilter = vm.filterList[0];
				vm.oldSelectedFilter = vm.selectedFilter;
			}
		});
		
	}
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
