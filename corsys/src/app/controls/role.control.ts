import { Component, Inject, OnInit, Input, OnDestroy } from '@angular/core';
import { IResponse, IRole, IKeyData, IUserSelectedRole, IRoleWithApps } from '../models/viewModels';
import { ICommonService, IRoleService, IMessageService, ISortService, IBroadcastService } from '../interfaces/interfaces';
import { responseStatus, messageType, sortOrder, roleStatus, page } from '../models/enums';
import {Subject} from 'rxjs/Rx';
@Component({
		selector: 'sp3-comp-roles',
		templateUrl: './role.control.html',
})

export class SpRolesComponent implements OnInit, OnDestroy{
		@Input() public controlId: string;

		rolesList: IRole[] = [];
		message: string;
		showError: boolean;
		getRoles: () => void;
		index: number;
		tempUserSelectedRole: IUserSelectedRole;
		usersSelectedRolesList: IUserSelectedRole[] = [];
		selectedRole: IUserSelectedRole;
		setUsersRoleList: () => void;
		usersRoleList: IRoleWithApps[] = [];
		selectedRoleList: IUserSelectedRole[] = [];
		onChange: (event: any, value: any, name: any) => void;
    ngUnsubscribe: Subject<any> = new Subject <any>();
		ngOnInit() {
				var vm = this;
				vm.getRoles();
		}
		ngOnDestroy() {
				var vm = this;
				vm.rolesList = [];
				vm.usersRoleList = [];
        vm.usersSelectedRolesList = [];
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
		}

		constructor( @Inject('IRoleService') private roleService: IRoleService,
				@Inject('ICommonService') commonService: ICommonService,
				@Inject('IBroadcastService') private broadcastService: IBroadcastService,
				@Inject('IMessageService') private messageService: IMessageService,
				@Inject('ISortService') sortService: ISortService) {
				var vm = this;

				vm.getRoles = () => {
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
														vm.rolesList = sortService.sortCaseIndependent(result.data, 'name', sortOrder.Asc);
														for (var role in vm.rolesList) {
																if (vm.rolesList[role].status === roleStatus.Active) {
																		vm.tempUserSelectedRole = {
																				id: vm.rolesList[role].id,
																				name: vm.rolesList[role].name,
																				checked: false
																		};
																		vm.usersSelectedRolesList.push(vm.tempUserSelectedRole);
																}
														}
														if (vm.usersRoleList.length > 0) {
																prepareCommonRoleSet();
														}
																
												}

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

				function prepareCommonRoleSet() {
						for (var i = 0; i < vm.usersSelectedRolesList.length; i++) {
								var role = vm.usersSelectedRolesList[i];
								let index = Object.keys(vm.usersRoleList).find(k => vm.usersRoleList[k].name === role.name);
								if (index) {
										role.checked = true;
								}
										
								else {
										role.checked = false;
								}
										
						}
				}


				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
						if (result.key === 'userView') {
								var userDetail = result.data;

								vm.usersRoleList = [];

								if (userDetail != null) {
										vm.usersRoleList = userDetail.roles;
								}
								prepareCommonRoleSet();
						}         
				});

				vm.onChange = (event: any, roleId: any) => {                                
						vm.selectedRole = vm.usersSelectedRolesList.find(k => k.id === roleId);           
						vm.broadcastService.broadcast(vm.controlId, vm.selectedRole);                     
				};

				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
						if (result.key === page.user.toString()) {
								vm.usersSelectedRolesList = [];
								vm.getRoles();
						}
				});


		}

}
