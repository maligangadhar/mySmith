import { Component, Inject, ViewChild, Output, EventEmitter, OnInit ,OnDestroy} from '@angular/core';
import { IResponse, IUser, IKeyValue, IKeyData, IUserDetail} from '../../models/viewModels';
import { ICommonService, IUserService, IMessageService, ISortService, IBroadcastService, ITranslateService } from '../../interfaces/interfaces';
import { responseStatus, messageType, sortOrder, action, page,spinnerType } from '../../models/enums';
import { UserDetailComponent } from '../user/user.detail.component';
import { Subscription } from 'rxjs/Subscription';
import { FilterListContentPipe } from '../../pipes/filterContentPipe';
import {Subject} from 'rxjs/Rx';

@Component({
		selector: 'sp3-comp-user-view',
		templateUrl: './user.view.component.html'
})

export class UserViewComponent implements OnInit ,OnDestroy{
		@Output() showUpdateUSer: EventEmitter<boolean> = new EventEmitter();
		@ViewChild(UserDetailComponent) userDetailComponent: UserDetailComponent;
		title: string;
		searchListOnFilterChange: IUser[] = [];
		getUsers: () => void;
		filteredStatus: number;
		selUserFilter: number;
		userSelected: IUserDetail;
		getFilteredList: (filter: number) => void;
		listSelectedUser: IUser;
		usersList: IUser[] = [];
		filteredUsersList: IUser[] = [];
		allUsersListFiltered: IUser[] = [];
		activeUsersListFiltered: IUser[] = [];
		inActiveUsersListFiltered: IUser[] = [];
		message: string;
		showError: boolean;
		filterValue: number = 0;
		selUser: IKeyValue;
		oldUser: IKeyValue;
		selectedUser: IKeyValue;
		onUserSelectionChange: (event: any) => void;
		userSelectionChange: () => void;
		isDataChanged: boolean = false;
		isRoleSectionChanged: boolean = false;
		isRoleFilterChanged: boolean = false;
		userFilterChange: () => void;
		searchCriteria: any;
		subscription: Subscription;
		searchFilteredArray: IUser[] = [];
		toggleDataFound: boolean = false;
		viewListHeight: number = window.innerHeight - 304;	
    ngUnsubscribe:Subject<any> = new Subject<any>();
		ngOnInit() {
				var vm = this;

				vm.getUsers();
		}

		@Output()
		cardDisplayUpdate = new EventEmitter<boolean>();

		constructor( @Inject('IUserService') private userService: IUserService,
				@Inject('ICommonService') private commonService: ICommonService,				
				@Inject('IBroadcastService') private broadcastService: IBroadcastService,
				@Inject('IMessageService') private messageService: IMessageService,
				@Inject('ITranslateService') public translateService: ITranslateService,
				@Inject('ISortService') sortService: ISortService) {
				var vm = this;
				let filterPipe = new FilterListContentPipe();
				window.addEventListener('orientationchange', function() {
					vm.viewListHeight = window.innerHeight - 304;
				  });
				vm.messageService.OperationGoAhead.subscribe(item => {
						if (item && item.operationAllowed && item.from === action.userChange) {              
								vm.oldUser = vm.selUser;
								vm.userSelectionChange();
								vm.messageService.resetPageChange();
						}
						else if (item && item.from === action.userChange) {               
								vm.listSelectedUser = vm.filteredUsersList[Object.keys(vm.filteredUsersList).find(k => vm.filteredUsersList[k].id === vm.oldUser.id)];
								vm.onUserSelectionChange(vm.listSelectedUser);
						}
				});

				
				vm.subscription = vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe(iMessage => {
						if (iMessage.key === 'userSearchPublish') {
								vm.searchCriteria = iMessage.data.eventMessage;
								vm.searchFilteredArray = filterPipe.transform(vm.filteredUsersList, vm.searchCriteria);
								if (vm.searchFilteredArray.length) {
										vm.listSelectedUser = vm.searchFilteredArray[0];
										vm.onUserSelectionChange(vm.listSelectedUser);
										vm.cardDisplayUpdate.emit(true);
										vm.toggleDataFound = false;
								} else {
										vm.broadcastService.broadcast('userView', null);
										vm.cardDisplayUpdate.emit(false);
										vm.toggleDataFound = true;
								}
						}

				});

				vm.getFilteredList = (userFilter: number) => {
						vm.filteredUsersList = [];
						switch (userFilter) {
								case 0: vm.filteredUsersList = vm.allUsersListFiltered;
										break;
								case 1: vm.filteredUsersList = vm.activeUsersListFiltered;
										break;
								case 2: vm.filteredUsersList = vm.inActiveUsersListFiltered;
										break;
								default: vm.filteredUsersList = vm.allUsersListFiltered;
										break;
						}

				};
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
						if (result.key === 'userFilter') {
								vm.selUserFilter = result.data;
								vm.userFilterChange();
						}
						else if (result.key === 'canceluserFilter') {
								let oldUserId = vm.selUser.id;               
								vm.selUserFilter = result.data;
								vm.userFilterChange();
								vm.listSelectedUser = vm.filteredUsersList[Object.keys(vm.filteredUsersList).find(k => vm.filteredUsersList[k].id === oldUserId)];
								vm.onUserSelectionChange(vm.listSelectedUser);
						}
						else if (result.key === 'userUpdated') {
								vm.messageService.setPageChange(action.userEdit, false);
						}
						else if (result.key === 'createUserCancelled') {               
								vm.getUsers();
						}
						else if (result.key === 'EditUserCancelled') {                
								vm.messageService.setPageChange(action.userEdit, false);
								vm.listSelectedUser = vm.filteredUsersList[Object.keys(vm.filteredUsersList).find(k => vm.filteredUsersList[k].id === vm.oldUser.id)];
								vm.onUserSelectionChange(vm.listSelectedUser);
						}    
						else if (result.key === 'cancelUserSearch') {               
								vm.listSelectedUser = vm.filteredUsersList[Object.keys(vm.filteredUsersList).find(k => vm.filteredUsersList[k].id === vm.oldUser.id)];
								vm.onUserSelectionChange(vm.listSelectedUser);
						} 
				});

				vm.userFilterChange = () => {
						vm.getFilteredList(vm.selUserFilter);
						vm.searchListOnFilterChange = filterPipe.transform(vm.filteredUsersList, vm.searchCriteria);
						if (vm.searchListOnFilterChange[0]) {
								vm.listSelectedUser = vm.searchListOnFilterChange[0];
								vm.onUserSelectionChange(vm.searchListOnFilterChange[0]);
								vm.cardDisplayUpdate.emit(true);
								vm.toggleDataFound = false;
						}
						else {
								vm.broadcastService.broadcast('userView', null);
								vm.cardDisplayUpdate.emit(false);
								vm.toggleDataFound = true;
						}
				};

				vm.commonService.NewUserAddedChange.subscribe((result: boolean) => {
						if (result === true && !this.commonService.UserChanged) {							
							vm.commonService.UserChanged = true;		
							vm.getUsers();										
						}	
						else
						{
							if(result === false)
							{								
								vm.commonService.UserChanged = false;								
							}							
						}				
				});				

				vm.commonService.UserUpdatedChange.subscribe((result: boolean) => {
						if (result === true && !this.commonService.UserChanged) {							
							vm.commonService.UserChanged = true;		
							vm.getUsers();										
						}	
						else
						{
							if(result === false)
							{								
								vm.commonService.UserChanged = false;								
							}							
						}				
				});				

				vm.getUsers = () => {
						this.messageService.LoaderMessage = { id: '', headerMessage:  vm.translateService.instant('Users'), footerMessage:  vm.translateService.instant('UserLoading'), showLoader: true, type: spinnerType.small }; 
						vm.activeUsersListFiltered = [];
						vm.inActiveUsersListFiltered = [];
						vm.filteredUsersList = [];
						vm.allUsersListFiltered = [];
						vm.usersList = [];
						vm.message = '';
						vm.showError = false;

						vm.userService.getUsers().subscribe(result => {
								if (result.status === responseStatus.Success) {
										if (!result.data || result.data.length === 0) {
												vm.messageService.Message = { message: 'UsersNotExist', showMessage: true, type: messageType.Error };
										}
										else {
												if (result.data.length > 0) {
														vm.usersList = result.data;
												}

												for (var user in vm.usersList) {
														if (vm.usersList[user].status === 1) {
																vm.activeUsersListFiltered.push(vm.usersList[user]);
														}
														else if (vm.usersList[user].status === 2) {
																vm.inActiveUsersListFiltered.push(vm.usersList[user]);
														}
												}
												vm.filteredUsersList = sortService.sortCaseIndependent(vm.usersList, 'fullName', sortOrder.Asc);
												vm.activeUsersListFiltered = sortService.sortCaseIndependent(vm.activeUsersListFiltered, 'fullName', sortOrder.Asc);
												vm.inActiveUsersListFiltered = sortService.sortCaseIndependent(vm.inActiveUsersListFiltered, 'fullName', sortOrder.Asc);
												vm.allUsersListFiltered = vm.filteredUsersList;												
												if(vm.selUserFilter != undefined)
												{
													vm.getFilteredList(vm.selUserFilter);
												}											
												if (this.commonService.NewUserAdded || this.commonService.UserUpdated) {														
														vm.listSelectedUser = vm.filteredUsersList[Object.keys(vm.filteredUsersList).find(k => vm.filteredUsersList[k].id === vm.commonService.newUser.id)];
														if(!vm.listSelectedUser)
														{
															if(vm.filteredUsersList.length > 0)
															{
																vm.listSelectedUser = vm.filteredUsersList[0];
																vm.onUserSelectionChange(vm.listSelectedUser);
															}
															else {																
																vm.broadcastService.broadcast('userView', null);
															}
														}
														else
														{
															if(this.commonService.NewUserAdded)
															{
																vm.onUserSelectionChange(vm.listSelectedUser);
															}
														}														

														vm.commonService.newUser = null;
														this.commonService.NewUserAdded = false;
														this.commonService.UserUpdated = false;															
												}													
												else {
													if (vm.filteredUsersList.length > 0) {
															vm.listSelectedUser = vm.filteredUsersList[0];
															vm.onUserSelectionChange(vm.listSelectedUser);
													}
													else {
															vm.broadcastService.broadcast('userView', null);													}
												}
												this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UserLoading'), showLoader: false, type: spinnerType.small }; 
										}										
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

				vm.userSelectionChange = () => {
						vm.selectedUser = vm.selUser;
						if (vm.selectedUser != null) {
							vm.showUpdateUSer.emit(false);  
							this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UserDetailLoading'), showLoader: true, type: spinnerType.small }; 
								vm.userService.getUser(vm.selectedUser.id).subscribe(result => {
										if (result.status === responseStatus.Success) {
												vm.userSelected = result.data;
												vm.broadcastService.broadcast('userView', vm.userSelected);
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

				vm.onUserSelectionChange = (event: any) => {
						if (this.messageService.showLeaveMessage(action.userChange)) {
								vm.oldUser = vm.selUser;
								vm.selUser = event;
								this.messageService.LeaveMessage = { key: 'Users', showMessage: true, type: action.userChange };
						}
						else {
								vm.selUser = event;
								vm.oldUser = event;
								vm.userSelectionChange();
						}
				};

				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
						if (result.key === page.user.toString()) {
								vm.getUsers();
								vm.userSelectionChange();
						}
				});
    }
    ngOnDestroy(): void {
       this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
