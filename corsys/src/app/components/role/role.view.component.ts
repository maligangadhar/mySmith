import { Component, Inject, ViewChild, Output, EventEmitter, OnInit,OnDestroy } from '@angular/core';
import { IResponse, IRole, IRoleDetail, IKeyValue, IKeyData } from '../../models/viewModels';
import { ICommonService, IRoleService, IMessageService, ISortService, IBroadcastService, ITranslateService } from '../../interfaces/interfaces';
import { responseStatus, messageType, sortOrder, action, page, spinnerType } from '../../models/enums';
import { ModalCreateRoleComponent } from '../modal/modal.role.create.component';
import { RoleDetailComponent } from '../role/role.detail.component';
import { Subscription } from 'rxjs/Subscription';
import {Subject} from 'rxjs/Rx';
import { FilterRoleListContentPipe } from '../../pipes/filterRoleContentPipe';
@Component({
		selector: 'sp3-comp-role-view',
		templateUrl: './role.view.component.html',
})

export class ViewRoleComponent implements OnInit ,OnDestroy{
		@ViewChild(ModalCreateRoleComponent) modal: ModalCreateRoleComponent;
		@ViewChild(RoleDetailComponent) roleDetailComponent: RoleDetailComponent;
		//  @ViewChild('modalDataChangeAlert') modalDataChangeAlert: ModalConfirmComponent;
		@Output() showUpdateRole: EventEmitter<boolean> = new EventEmitter();
		selectedRole: IKeyValue;
		onRoleSelectionChange: (event: any) => void;
		roleSelected: IRoleDetail;
		rolesList: IRole[] = [];

		message: string;
		showError: boolean;
		getRoles: () => void;
		onCreateRole: () => void;
		createRole: () => void;
		filteredStatus: number;
		getFilteredList: (filter: number) => void;
		listSelectedRole: IRole;
    ngUnsubscribe:Subject<any>=new Subject<any>();
		filteredRoleList: IRole[] = [];
		allRolesListFiltered: IRole[] = [];
		activeRolesListFiltered: IRole[] = [];
		inActiveRolesListFiltered: IRole[] = [];
		dummyRole: IRoleDetail = {
				id: null, name: null, description: null,
				status: null,
				apps: null,
				users: null,
				locationId: null
		};
		filterValue: number = 0;
		tempRole: IKeyValue = { id: 0, name: '' };

		id: string = 'roleEdit';
		selectedAppsId: string = 'roleEditApps';
		isRoleSectionChanged: boolean = false;
		isRoleFilterChanged: boolean = false;
		selRoleFilter: number;
		selRole: IKeyValue;
		oldSelRole: IRole;
		searchFilteredListOnChange: IRole[] = [];
		roleSelectionChange: () => void;
		roleFilterChange: () => void;
		yesClick: () => void;
		noClick: () => void;
		oldRoleId: number;
		oldFilterId: number;
		searchCriteria: any;
		subscription: Subscription;
		searchFilteredArray: IRole[] = [];
		toggleDataFound: boolean = false;
		viewListHeight: number = window.innerHeight - 304;
		@Output()
		cardDisplayUpdate = new EventEmitter<boolean>();

		constructor( @Inject('IRoleService') private roleService: IRoleService,
				@Inject('ICommonService') private commonService: ICommonService,
				@Inject('IBroadcastService') private broadcastService: IBroadcastService,
				@Inject('IMessageService') private messageService: IMessageService,
				@Inject('ITranslateService') public translateService: ITranslateService,
				@Inject('ISortService') public sortService: ISortService) {
				var vm = this;
				let filterPipe = new FilterRoleListContentPipe();
				window.addEventListener('orientationchange', function() {
					vm.viewListHeight = window.innerHeight - 350;
				  });
				vm.subscription = vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe(iMessage => {
						if (iMessage.key === 'roleSearchPublish') {
								vm.searchCriteria = iMessage.data.eventMessage;
								vm.searchFilteredArray = filterPipe.transform(vm.filteredRoleList, iMessage.data.eventMessage);
								if (vm.searchFilteredArray.length) {
										vm.listSelectedRole = vm.searchFilteredArray[0];
										vm.onRoleSelectionChange(vm.listSelectedRole);
										vm.cardDisplayUpdate.emit(true);
										vm.toggleDataFound = false;
								} else {
											//vm.sharedRole.setRoleDetail(null);
											broadcastService.broadcast('roleDetails', null);
											vm.cardDisplayUpdate.emit(false);
											vm.toggleDataFound = true;
								}
						}
				});
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((roleDetail: IKeyData) => {
						if (roleDetail.data && roleDetail !== null && roleDetail.key === 'roleDetails') {	
							  vm.oldRoleId = roleDetail.data.id;
						}
				});
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
						if (result.key === vm.id) {
								if (result.data != null) {
										vm.messageService.setPageChange(action.roleEdit, true);
								}
								else {
										vm.messageService.setPageChange(action.roleEdit, false);
								}
						}

						if (result.key === vm.selectedAppsId) {
								vm.messageService.setPageChange(action.roleEdit, true);
						}

						if (result.key === 'roleUpdated') {
								vm.messageService.setPageChange(action.roleEdit, false);
						}
				});

				vm.commonService.NewRoleAddedChange.subscribe((result: boolean) => {
						if (result === true  && !this.commonService.RoleUpdated) {
								vm.commonService.RoleUpdated = true;
								vm.getRoles();
						}
						else {
							if(result === false)
							{								
								vm.commonService.RoleUpdated = false;								
							}							
						}	
				});
				vm.getFilteredList = (roleFilter: number) => {
						vm.filteredRoleList = [];
						switch (roleFilter) {
								case 0: vm.filteredRoleList = vm.allRolesListFiltered;
										break;
								case 1: vm.filteredRoleList = vm.activeRolesListFiltered;
										break;
								case 2: vm.filteredRoleList = vm.inActiveRolesListFiltered;
										break;
								default: vm.filteredRoleList = vm.allRolesListFiltered;
										break;
						}
				};
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((roleFilter: IKeyData) => {
						if (roleFilter !== null && roleFilter.key === 'roleFilter') {
							vm.selRoleFilter = roleFilter.data;
						  vm.roleFilterChange();
						}
				});
				vm.roleFilterChange = () => {
						vm.getFilteredList(vm.selRoleFilter);
						if (this.commonService.roleModified !== true) {
								vm.searchFilteredListOnChange = filterPipe.transform(vm.filteredRoleList, vm.searchCriteria);

								if (vm.searchFilteredListOnChange[0]) {
										vm.listSelectedRole = vm.searchFilteredListOnChange[0];
										vm.onRoleSelectionChange(vm.listSelectedRole);
										vm.cardDisplayUpdate.emit(true);
										vm.toggleDataFound = false;
								}
								else {
										//vm.sharedRole.setRoleDetail(null);
										broadcastService.broadcast('roleDetails', null);
										vm.cardDisplayUpdate.emit(false);
										vm.toggleDataFound = true;
								}
						}
						else {
								this.commonService.roleModified = false;
						}
				};

				this.messageService.OperationGoAhead.subscribe(item => {          
						if (item && item.operationAllowed && item.from === action.roleAddButtonClick) {               
								vm.createRole();
								this.messageService.CurrentPage = page.role;
								this.messageService.resetPageChange();
						}

						if (item.operationAllowed) {
								//this.sharedRole.IsCancelled = true;
								broadcastService.broadcast('IsCancelled', true);
								broadcastService.broadcast('roleCancelled', true);
								this.messageService.LeaveMessage = { key: 'Roles', showMessage: false, type: null };
								this.messageService.resetPageChange();

								if (vm.isRoleSectionChanged || item.from === action.roleCreate) {
										vm.roleSelectionChange();
								}

								vm.isRoleFilterChanged = false;
								vm.isRoleSectionChanged = false;
								vm.broadcastService.broadcast('roleEdit', null);								
						}

						else {
							//	this.sharedRole.IsCancelled = false;
								broadcastService.broadcast('IsCancelled', false);
								broadcastService.broadcast('roleCancelled', false);
								if (vm.isRoleSectionChanged) {
										vm.listSelectedRole = vm.filteredRoleList[Object.keys(vm.filteredRoleList).find(k => vm.filteredRoleList[k].id === vm.oldRoleId)];
								}
								
								this.messageService.LeaveMessage = { key: 'Roles', showMessage: false, type: null };

								vm.isRoleFilterChanged = false;
								vm.isRoleSectionChanged = false;
						}
				});

				vm.getRoles = () => {
						vm.activeRolesListFiltered = [];
						vm.inActiveRolesListFiltered = [];
						vm.filteredRoleList = [];
						vm.allRolesListFiltered = [];
						vm.rolesList = [];
						vm.message = '';
						vm.showError = false;
						vm.roleService.getRoles().subscribe(result => {
								if (result.status === responseStatus.Success) {
										if (!result.data || result.data.length === 0) {
												vm.messageService.Message = { message: 'RolesNotExist', showMessage: true, type: messageType.Error };
										}
										else {
												commonService.RolesList = result.data;
												if (result.data.length > 0) {
														vm.rolesList = result.data;
												}
												// vm.activeRolesListFiltered = vm.rolesList.select(x => x.status === 1);

												for (var role in vm.rolesList) {
														if (vm.rolesList[role].status === 1) {
																vm.activeRolesListFiltered.push(vm.rolesList[role]);
														}
														else if (vm.rolesList[role].status === 2) {
																vm.inActiveRolesListFiltered.push(vm.rolesList[role]);
														}
												}
												vm.filteredRoleList = sortService.sortCaseIndependent(vm.rolesList, 'name', sortOrder.Asc);
												vm.activeRolesListFiltered = sortService.sortCaseIndependent(vm.activeRolesListFiltered, 'name', sortOrder.Asc);
												vm.inActiveRolesListFiltered = sortService.sortCaseIndependent(vm.inActiveRolesListFiltered, 'name', sortOrder.Asc);
												vm.allRolesListFiltered = vm.filteredRoleList;
												if(vm.selRoleFilter != undefined)
												{
													vm.getFilteredList(vm.selRoleFilter);
												}	
												if (this.commonService.NewRoleAdded) {
														vm.listSelectedRole = vm.filteredRoleList[Object.keys(vm.filteredRoleList).find(k => vm.filteredRoleList[k].id === vm.commonService.newRole.id)];
														
														if(!vm.listSelectedRole)
														{
															if(vm.filteredRoleList.length > 0)
															{
																vm.listSelectedRole = vm.filteredRoleList[0];
																vm.onRoleSelectionChange(vm.listSelectedRole);
															}
															else {
																vm.broadcastService.broadcast('roleDetails', null);
															}
														}											
														this.commonService.NewRoleAdded = false;
														vm.commonService.newRole = null;
												}
												else {
														if (vm.filteredRoleList.length > 0) {
																vm.listSelectedRole = vm.filteredRoleList[0];
																vm.onRoleSelectionChange(vm.listSelectedRole);
														}
														else {
																//vm.sharedRole.setRoleDetail(null);
																broadcastService.broadcast('roleDetails', null);
														}
												}
										}
								}
								else {
									this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RoleLoading'), showLoader: false, type: spinnerType.small }; 
										vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
								}
						},
								(error: IResponse<any>) => {
										vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
								}
						);
				};

				vm.onCreateRole = () => {       
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RoleLoading'), showLoader: true, type: spinnerType.small }; 
						if (this.messageService.showLeaveMessage(action.roleAddButtonClick)) {                
								this.messageService.LeaveMessage = { key: 'Roles', showMessage: true, type: action.roleAddButtonClick };
						}
						else {               
								vm.createRole();
						}
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RoleLoading'), showLoader: false, type: spinnerType.small }; 
				};

				vm.createRole = () => {
						broadcastService.broadcast('roleFilter', 0);
						vm.modal.show();
				};
       	vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((role: IKeyData) => {
						if (role !== null && role.key === 'roleCancelled') {
								vm.roleSelectionChange();
						}
				});
				vm.roleSelectionChange = () => {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RoleLoading'), showLoader: true, type: spinnerType.small }; 
						vm.selectedRole = vm.selRole;
						vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
						if (vm.selectedRole != null) {
								vm.roleService.getRole(vm.selectedRole.id).subscribe(result => {
										if (result.status === responseStatus.Success) {
											vm.showUpdateRole.emit(false);
											vm.roleSelected = result.data;																				
											broadcastService.broadcast('roleSelectionChange', vm.roleSelected);																																				
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
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RoleLoading'), showLoader: false, type: spinnerType.small }; 
				};

				vm.onRoleSelectionChange = (event: any) => {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RoleDetailLoading'), showLoader: true, type: spinnerType.small }; 
						vm.selRole = event;
						if (this.messageService.showLeaveMessage(action.roleChange)) {
								vm.isRoleSectionChanged = true;
							
										this.messageService.LeaveMessage = { key: 'Roles', showMessage: true, type: action.roleChange };
						}
						else {
								vm.roleSelectionChange();
						}
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Roles'), footerMessage: vm.translateService.instant('RoleDetailLoading'), showLoader: false, type: spinnerType.small }; 
				};
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
						if (result.key === page.role.toString()) {
								vm.getRoles();
								vm.roleSelectionChange();
						}
				});
		}
		ngOnInit() {
				this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Roles'), footerMessage: this.translateService.instant('RoleDetailLoading'), showLoader: true, type: spinnerType.small }; 
				this.getRoles();
    }
    ngOnDestroy(): void {
       this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }  
}
