import { Component, Inject, Input, Output, OnInit, OnDestroy, ViewChild, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';

import { IResponse, IUserDetail, IApp, IKeyValue, IRoleWithApps, IKeyData, IUserSelectedRole } from '../../models/viewModels';
import { IMessageService, IBroadcastService, IRoleService, IDateFormatService, ICommonService, IUserService, ITranslateService, IGeneralSettings } from '../../interfaces/interfaces';
import { responseStatus, messageType, action, opMode, size, spinnerType, metaDataSettings } from '../../models/enums';
import {Subject} from 'rxjs/Rx';
import { ModalCreateUserComponent } from '../modal/modal.user.create.component';
@Component({
		selector: 'sp3-comp-user-detail',
		templateUrl: './user.detail.component.html'
})

export class UserDetailComponent implements OnInit, OnChanges, OnDestroy{
		@ViewChild(ModalCreateUserComponent) modalCreate: ModalCreateUserComponent;	 
		@Input() public mode?: opMode;			
		@Input() public isNoLicenseMessageShown: boolean = false;
		@Output() public licenseMessageUpdate: EventEmitter<boolean> = new EventEmitter<boolean>();
		@Output() public modeUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();

		userDetail: IUserDetail = null;
		//addNewUserPanel: boolean = false;
		IsSuccess: boolean;
		oldUserDetail: IUserDetail = null;
		userDetailInfo: IUserDetail = null;    
		userStatus: IKeyValue;
		empStatus: IKeyValue;   
		createMode: string = 'userCreate';
		editMode: string = 'userEdit';
		id: string = 'userCreate';
		createUserAppsId: string = 'selectedUserRoleAppsId';
		userAppsId: string = 'userEditApps';
		statusList: IKeyValue[] = [];
		empStatusList: IKeyValue[] = [];
		userRoles: IRoleWithApps[] = [];
		userRoleApps: IApp[] = [];
		selectedRole: IUserSelectedRole;
		selectedRoleWithApps: IRoleWithApps;
		toggleLicenceFlag: boolean = false;
		toggleDisableSwitchFlag: boolean = false;
		isEmailInvalid: boolean = false;
		IsSaveDisabled: boolean;
		IsCancelDisabled: boolean;
		updateUser: () => void;
		updateUserClick: () => void;
		cancelUpdateUser: () => void;
		getSaveButtonDisabled: () => boolean;
    	ngUnsubscribe:Subject<any>=new Subject<any>();
		onTextAdded: (text: string) => void;
		onEmailValidated: (isEmailInvalid: boolean) => void;
		onSelectChanged: (selectedValue: IKeyValue) => void;
		onUserStatusSelectChanged: (selectedValue: IKeyValue) => void;
		setBindings: (userDetail: IUserDetail) => void;
		sendData: () => void;
		setRoleApps: () => void;
		reset: () => void;	
		size: size = 1;
		createUser: () => void;
		getLicenseSwitchState: (flag: boolean) => void;
		//onCreateUser: () => void;
		//cancelUpdateUser: () => void;

		ngOnInit() {
				var vm = this;
				if (vm.mode === 1) {
						vm.size = 2;
				}
						
				else {
						vm.size = 1;
				}						

				this.reset();
		}

		constructor(@Inject('IMessageService') private messageService: IMessageService,
				@Inject('IRoleService') private roleService: IRoleService,
				@Inject('IBroadcastService') private broadcastService: IBroadcastService,
				@Inject('IDateFormatService') private dateFormatService: IDateFormatService,
				@Inject('ICommonService') private commonService: ICommonService,
				@Inject('ITranslateService') public translateService: ITranslateService,
				@Inject('IGeneralSettings') private generalSettingsService: IGeneralSettings,
				@Inject('IUserService') private userService: IUserService) {

				var vm = this;
				
				 vm.getLicenseSwitchState = (flag: boolean) => {					
					vm.toggleLicenceFlag = flag;	
					if (vm.toggleLicenceFlag !== vm.userDetail.assignedLicense) {
						if (vm.id === vm.createMode) {
								vm.messageService.setPageChange(action.userCreate, true);
						}
						else if (vm.id === vm.editMode) {
								vm.messageService.setPageChange(action.userEdit, true);
						}
					}

					vm.sendData();				
				};			

				vm.reset = () => {	
					   vm.toggleLicenceFlag = false;	
					   vm.isNoLicenseMessageShown = false;
					   vm.toggleDisableSwitchFlag = false;	
					   
						//vm.statusList = [{ id: 1, name: 'Active' }, { id: 2, name: 'InActive' }];
						//vm.userStatus = vm.statusList[0];						
						vm.generalSettingsService.fetchStatusMetaData(metaDataSettings[metaDataSettings.Users].toString()).subscribe(result => {
							if (result.status === responseStatus.Success) {
								if (result.data) {
									vm.statusList = result.data.UserStatus;
									vm.userStatus = vm.statusList[0];

									vm.empStatusList = [{ id: 0, name: '' }, { id: 1, name: 'Permanent' }, { id: 2, name: 'Contract' }];
									vm.empStatus = vm.empStatusList[0];          
									vm.userDetailInfo = {
											id: 0, userName: '', fullName: '', email: '', telephone: '', mobile: '',
											status: vm.userStatus.id, employementStatus: vm.empStatus.name, position: '', createDate: new Date(), createdBy: '',
											modifiedDate: new Date(), modifiedBy: '', roles: [], assignedLicense: false,locations:'',locationcode:''
									};
									vm.id = vm.createMode;
									vm.modeUpdated.emit(true);
									vm.userDetail = {
											id: 0, userName: '', fullName: '', email: '', telephone: '', mobile: '',
											status: 1, employementStatus: '', position: '', createDate: new Date(), createdBy: '',
											modifiedDate: new Date(), modifiedBy: '', roles: [], assignedLicense: false,locations:'',locationcode:''
									};

									vm.messageService.setPageChange(action.userCreate, false);
									vm.messageService.setPageChange(action.userEdit, false);
									vm.userRoles = [];
									vm.userDetail.roles = [];
								}
							}				
						},
						(error: IResponse<any>) => {					
							vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
						});						
				};


				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
						if (result.key === 'userView') {
					
								vm.IsSuccess = false;
								this.IsSaveDisabled = true;
								this.IsCancelDisabled = true;

								vm.id = vm.editMode;
								vm.modeUpdated.emit(false);
								var userDetail = result.data;

								vm.isNoLicenseMessageShown = false;
								vm.toggleDisableSwitchFlag = false;									
								
								if (userDetail !== null) {
										vm.IsSuccess = false;									
										userDetail.createDate = vm.dateFormatService.operationalDate(userDetail.createDate);											
										vm.oldUserDetail = {
												id: userDetail.id, userName: userDetail.userName, fullName: userDetail.fullName, email: userDetail.email,
												telephone: userDetail.telephone, mobile: userDetail.mobile, status: userDetail.status, employementStatus: userDetail.employementStatus,
												position: userDetail.position, createDate: userDetail.createDate, createdBy: userDetail.createdBy,
												modifiedDate: userDetail.modifiedDate, modifiedBy: userDetail.modifiedBy, roles: userDetail.roles, 
												assignedLicense: userDetail.assignedLicense ? userDetail.assignedLicense : false,locations:'',locationcode:''
										};

										vm.userDetail = userDetail;										
										vm.userRoles = userDetail.roles;
										vm.toggleLicenceFlag = userDetail.assignedLicense ? userDetail.assignedLicense : false;
										vm.isNoLicenseMessageShown = false;
										vm.toggleDisableSwitchFlag = false;
										//vm.licenseMessageUpdate.emit(vm.toggleLicenceFlag);
										vm.licenseMessageUpdate.emit(vm.isNoLicenseMessageShown);

										vm.setRoleApps();
										vm.setBindings(userDetail);
										
										if(!vm.commonService.NewUserAdded)
										{
											vm.IsSuccess = false;
										}
										
										vm.IsSaveDisabled = vm.getSaveButtonDisabled();
										this.IsCancelDisabled = false;	
										this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UserLoading'), showLoader: false, type: spinnerType.small };
										
								}
								else {
										this.userDetail = null;
								}								
						}
						else if (result.key === 'createUserSelectedRoleId' || result.key === 'editUserSelectedRoleId') {
								if (result.key === 'createUserSelectedRoleId') {
										vm.id = vm.createMode;
										vm.modeUpdated.emit(true);
								}
								else if (result.key === 'editUserSelectedRoleId') {
										vm.id = vm.editMode;
										vm.modeUpdated.emit(false);
								}
								
								vm.selectedRole = result.data;
								if (vm.userDetail && vm.userDetail.roles) {
										if (vm.selectedRole.checked) {
												vm.roleService.getRole(vm.selectedRole.id).subscribe(result => {
													if (result.status === responseStatus.Success) {
															let roleDetail = result.data;
															vm.selectedRoleWithApps = {
																	id: roleDetail.id, name: roleDetail.name,
																	status: roleDetail.status, apps: roleDetail.apps,locationId:''
															};
															vm.userRoles.push(vm.selectedRoleWithApps);
															vm.userDetail.roles = vm.userRoles;
															vm.setRoleApps();
															vm.sendData();
													}
													else {
															vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
													}
												},
													(error: IResponse<any>) => {
															vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
													});
										}
										else if (!vm.selectedRole.checked) {
											var index = exists(vm.selectedRole);
											if (index > -1) {
													vm.userDetail.roles.splice(index, 1);
											}
											vm.setRoleApps();
											vm.sendData();
										}

										if (result.key === 'createUserSelectedRoleId') {
											vm.messageService.setPageChange(action.userCreate, true);
										}
										else if (result.key === 'editUserSelectedRoleId') {
											vm.messageService.setPageChange(action.userEdit, true);
										}
								}
						}  	
						else if (result.key === 'editUserEmailInput') {
							vm.isEmailInvalid = result.data;
							vm.IsSaveDisabled = vm.getSaveButtonDisabled();
							this.IsCancelDisabled = false;
						}						         
				});

				vm.setBindings = (userDetail: IUserDetail) => {            
						vm.userDetailInfo = {
							id: userDetail.id, userName: userDetail.userName, fullName: userDetail.fullName, email: userDetail.email,
							telephone: userDetail.telephone, mobile: userDetail.mobile, status: userDetail.status, employementStatus: userDetail.employementStatus,
							position: userDetail.position, createDate: userDetail.createDate, createdBy: userDetail.createdBy,
							modifiedDate: userDetail.modifiedDate, modifiedBy: userDetail.modifiedBy, roles: userDetail.roles, locations:'',locationcode:'',
							assignedLicense: true
						};

						if (userDetail.status === 1) {
							vm.userStatus = vm.statusList[0];
						}
						else {
							vm.userStatus = vm.statusList[1];
						}

						if (userDetail.employementStatus.toLowerCase() === 'permanent') {

							vm.empStatus = vm.empStatusList[1];
						}
						else if (userDetail.employementStatus.toLowerCase() === 'contract') {

							vm.empStatus = vm.empStatusList[2];
						}
						else {
							vm.empStatus = vm.empStatusList[0];
						}
				};

				function exists(role: IUserSelectedRole): number {
						for (var i = 0; i < vm.userDetail.roles.length; i++) {
							if (vm.userRoles[i].id === role.id) {
								return i;
							}
						}
						return -1;
				}

				vm.setRoleApps = () => {
						vm.userRoleApps = [];

						vm.userRoles.forEach((role) => {
								if (role != undefined) {
									if (role.apps) {
										role.apps.forEach((app) => {
											if (vm.userRoleApps.find(obj => obj.id === app.id) === undefined) {
												vm.userRoleApps.push(app);
											}
										});
									}
								}
						});

						if (vm.id === vm.editMode) {
							vm.broadcastService.broadcast(vm.userAppsId, vm.userRoleApps);
						}
						else if (vm.id === vm.createMode) {
							vm.broadcastService.broadcast(vm.createUserAppsId, vm.userRoleApps);
						}
				};

				vm.onTextAdded = (text: string) => {

						if (vm.userDetailInfo.userName !== vm.userDetail.userName || vm.userDetailInfo.fullName !== vm.userDetail.fullName
								|| vm.userDetailInfo.email !== vm.userDetail.email || vm.userDetailInfo.telephone !== vm.userDetail.telephone
								|| vm.userDetailInfo.position !== vm.userDetail.position || vm.userDetailInfo.mobile !== vm.userDetail.mobile) {
								if (vm.id === vm.createMode) {
										vm.messageService.setPageChange(action.userCreate, true);
								}
								else if (vm.id === vm.editMode) {
										vm.messageService.setPageChange(action.userEdit, true);
								}
						}

						vm.sendData();
				};

				vm.onEmailValidated = (isEmailInvalid: boolean) => {
						if (vm.id === vm.editMode) {
							vm.broadcastService.broadcast('editUserEmailInput', isEmailInvalid);
						}
						else if (vm.id === vm.createMode) {
							vm.broadcastService.broadcast('createUserEmailInput', isEmailInvalid);
						}
				};

				vm.onUserStatusSelectChanged = (selectedValue: IKeyValue) => {
						vm.userStatus = selectedValue;

						if (vm.userStatus.id !== vm.userDetail.status) {
							if (vm.id === vm.createMode) {
									vm.messageService.setPageChange(action.userCreate, true);
							}
							else if (vm.id === vm.editMode) {
									vm.messageService.setPageChange(action.userEdit, true);
							}
						}

						vm.sendData();
				};

				vm.onSelectChanged = (selectedValue: IKeyValue) => {
						vm.empStatus = selectedValue;

						if (vm.empStatus.name !== vm.userDetail.employementStatus) {
							if (vm.id === vm.createMode) {
									vm.messageService.setPageChange(action.userCreate, true);
							}
							else if (vm.id === vm.editMode) {
									vm.messageService.setPageChange(action.userEdit, true);
							}
						}
						vm.sendData();
				};

				vm.sendData = () => {
						if ((vm.id === vm.createMode && vm.messageService.getPageChange(action.userCreate))
								|| (vm.id === vm.editMode && vm.messageService.getPageChange(action.userEdit))) {
								vm.userDetail = {
										id: vm.userDetailInfo.id, userName: vm.userDetailInfo.userName, fullName: vm.userDetailInfo.fullName,
										email: vm.userDetailInfo.email, telephone: vm.userDetailInfo.telephone, mobile: vm.userDetailInfo.mobile,
										status: vm.userDetailInfo.status, employementStatus: vm.userDetailInfo.employementStatus,
										position: vm.userDetailInfo.position, createDate: vm.userDetailInfo.createDate, createdBy: vm.userDetailInfo.createdBy,
										modifiedDate: vm.userDetailInfo.modifiedDate, modifiedBy: vm.userDetailInfo.modifiedBy, roles: vm.userDetailInfo.roles, 
										assignedLicense: vm.userDetailInfo.assignedLicense,locations:'',locationcode:''
								};                
								
								vm.userDetail.roles = vm.userRoles;              
								vm.userDetail.status = vm.userStatus.id;
								vm.userDetail.employementStatus = vm.empStatus.name;
								vm.userDetail.assignedLicense = vm.toggleLicenceFlag;

								vm.broadcastService.broadcast(vm.id, vm.userDetail);
						}
						
				};
				
			

				vm.getSaveButtonDisabled = () => {
					if (vm.userDetail.userName.trim().length !== 0 && vm.userDetail.fullName.trim().length !== 0
						&& vm.userDetail.email.trim().length !== 0 && vm.userDetail.telephone.trim().length !== 0 && !vm.isEmailInvalid)
					{						
						if(vm.id === vm.editMode && vm.messageService.getPageChange(action.userEdit))
						{								
							return false;	
						}
				
					return true;
					}
					return true;
				};	
		
				vm.updateUserClick = () => {
					/*if (vm.userDetail.roles.length === 0) {
						//vm.modalRoleAlert.show();
						return;
					} */
					vm.updateUser();
				};
				vm.cancelUpdateUser = () =>{
					if (vm.messageService.showLeaveMessage(action.userEditCancelClick)) {
						this.messageService.LeaveMessage = { key: 'Users', showMessage: true, type: action.userEditCancelClick };
					}
					else {
							this.broadcastService.broadcast('EditUserCancelled', true);
					}
				};
		
				vm.updateUser = () => {
					vm.IsSuccess = false;				
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UsersUpdating'), showLoader: true, type: spinnerType.small };
					vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
					this.isNoLicenseMessageShown = false;
					this.toggleDisableSwitchFlag = false;
					
					vm.userService.updateUser(vm.userDetail).subscribe(result => {	
						if (result.status === responseStatus.Success) {
							this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UsersUpdating'), showLoader: false, type: spinnerType.small };
							vm.messageService.resetPageChange();
							vm.commonService.newUser = vm.userDetail;							
							vm.commonService.UserUpdated = true;
							vm.broadcastService.broadcast('userUpdated', null);
							
							vm.IsSuccess = true;
							vm.IsSaveDisabled = true;
							this.IsCancelDisabled = false;						
						}
						else {
							this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UsersUpdating'), showLoader: false, type: spinnerType.small };
							if (result.status === responseStatus.APIError && result.messageKey === 'PFUM30002') {					
								vm.userDetail.assignedLicense = false;
								this.isNoLicenseMessageShown = true;
								this.toggleLicenceFlag = false;
								this.toggleDisableSwitchFlag = true;	
							}
							else
							{
								vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
							}											
						}
					},
						(error: IResponse<any>) => {
							this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UsersUpdating'), showLoader: false, type: spinnerType.small };
							vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
						}
					);
				};
		
				// vm.onCreateUser = () => {
				// 	if (this.messageService.showLeaveMessage(action.userAddButtonClick)) {
				// 		this.messageService.LeaveMessage = { key: 'Users', showMessage: true, type: action.userAddButtonClick };
				// 	}
				// 	else {
				// 		vm.createUser();
				// 	}
				// };
		
				// vm.createUser = () => {
				// 	vm.modalCreate.show();
				// };
				// vm.cancelUpdateUser = () => {
				// 	if (vm.messageService.showLeaveMessage(action.userEditCancelClick)) {
				// 		this.messageService.LeaveMessage = { key: 'Users', showMessage: true, type: action.userEditCancelClick };
				// 	}
				// 	else {
				// 		this.broadcastService.broadcast('EditUserCancelled', true);
				// 	}
				// };
	}
	ngOnChanges(changes: SimpleChanges) {
		
				if (changes['isNoLicenseMessageShown']) {
					if(changes['isNoLicenseMessageShown'].currentValue === true)
					{
						this.toggleLicenceFlag = false;
						this.toggleDisableSwitchFlag = true;	
					}
					else
					{
						this.toggleDisableSwitchFlag = false;
					}
				}
		}

    ngOnDestroy(): void {
      this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
