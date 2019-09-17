import { Component, ViewChild, Inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ICommonService, IMessageService, IUserService, IBroadcastService, ITranslateService } from '../../interfaces/interfaces';
import { IResponse, IKeyData, IUserDetail } from '../../models/viewModels';
import { responseStatus, messageType, action, spinnerType } from '../../models/enums';
import { ModalConfirmComponent } from '../modal/modal.confirm.component';
import { Subject } from 'rxjs/Rx';
@Component({
	selector: 'sp3-comp-modal-create-user',
	templateUrl: './modal.user.create.component.html'
})

export class ModalCreateUserComponent implements OnInit, OnDestroy {
	@ViewChild('modalClose') modalClose: ModalConfirmComponent;
	@ViewChild('modalRoleAlert') modalRoleAlert: ModalConfirmComponent;

	public visible = false;
	public visibleAnimate = false;
	showAddNewUserPanel: boolean;
	@Output() showUpdateUSer: EventEmitter<boolean> = new EventEmitter();
	@Output() showLicenseErrorMessage: EventEmitter<boolean> = new EventEmitter();

	isCreateEnable: boolean;
	id: string = 'userCreate';
	rolesCount: number = 0;
	userDetail: IUserDetail = null;
	isEmailInvalid: boolean = false;
	isNoLicenseMessageShown: boolean = false;
	isCreateMode: boolean = true;
	ngUnsubscribe: Subject<any> = new Subject<any>();
	show: () => void;
	hide: () => void;
	closeClick: () => void;
	getCreateButtonEnabled: () => boolean;
	yesClick: () => void;
	noClick: () => void;
	leaveClick: () => void;
	backClick: () => void;
	createUserClick: () => void;
	saveUser: () => void;
	reset: () => void;
	onModeUpdated: (isCreateMode:boolean) => void;

	constructor( @Inject('IMessageService') private messageService: IMessageService,
		@Inject('ICommonService') private commonService: ICommonService,
		@Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('IUserService') private userService: IUserService,
		@Inject('ITranslateService') public translateService: ITranslateService) {
		var vm = this;

		vm.onModeUpdated = (isCreateMode:boolean) => {
			vm.isCreateMode = isCreateMode;
		};

		vm.reset = () => {
			vm.userDetail = {
				id: 0, userName: '', fullName: '', email: '', telephone: '', mobile: '',
				status: 1, employementStatus: '', position: '', createDate: new Date(), createdBy: '',
				modifiedDate: new Date(), modifiedBy: '', roles: [], assignedLicense: false,locations:'',locationcode:''
			};
			vm.isEmailInvalid = false;
			this.messageService.resetPageChange();
		};

		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			if (result.key === vm.id) {
				vm.rolesCount = 0;
				if (result.data != null) {
					vm.rolesCount = result.data.roles.length;
					vm.userDetail = result.data;
				}
				vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			}
			else {
				if (result.key === 'createUserEmailInput') {
					vm.isEmailInvalid = result.data;
				}

				vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			}
		});

		vm.getCreateButtonEnabled = () => {
			if (vm.userDetail.userName.trim().length !== 0 && vm.userDetail.fullName.trim().length !== 0 && vm.userDetail.mobile.trim().length !== 0
				&& vm.userDetail.email.trim().length !== 0 && vm.userDetail.telephone.trim().length !== 0 && !vm.isEmailInvalid)
			{
				return false;
			}

			return true;
		};

		vm.show = () => {
			this.visible = true;
			setTimeout(() => this.visibleAnimate = true);
		};

		vm.hide = () => {
			this.visibleAnimate = false;
			setTimeout(() => this.visible = false, 300);
		};

		vm.closeClick = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			if (vm.messageService.getPageChange(action.userCreate)) {
				vm.modalClose.show();
				vm.showUpdateUSer.emit(true);
			}
			else {
				this.messageService.resetPageChange();
				vm.broadcastService.broadcast('createUserCancelled', null);
				vm.showUpdateUSer.emit(false);

			}
		};

		vm.leaveClick = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			vm.modalClose.hide();
			this.messageService.resetPageChange();
			vm.broadcastService.broadcast('createUserCancelled', null);
			vm.hide();
		};

		vm.backClick = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			vm.modalClose.hide();
		};

		vm.yesClick = () => {
			vm.modalRoleAlert.hide();
			vm.saveUser();
		};

		vm.noClick = () => {
			vm.modalRoleAlert.hide();
		};

		vm.createUserClick = () => {
			if (vm.rolesCount === 0) {
				vm.modalRoleAlert.show();
				return;
			}
			vm.saveUser();
		};

		vm.saveUser = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UsersSaving'), showLoader: true, type: spinnerType.small };
			vm.userDetail.assignedLicense = vm.userDetail.assignedLicense? vm.userDetail.assignedLicense: false;
			vm.userService.createUser(vm.userDetail).subscribe(result => {
				if (result.status === responseStatus.Success) {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UsersSaving'), showLoader: false, type: spinnerType.small };
					vm.showUpdateUSer.emit(false);
					vm.userDetail = result.data;
					vm.broadcastService.broadcast('createdNewUser', null);
					this.commonService.newUser = vm.userDetail;
					vm.broadcastService.broadcast('userView', vm.userDetail);
					vm.commonService.NewUserAdded = true;
					vm.reset();
					this.messageService.resetPageChange();
					vm.hide();
				}
				else {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UsersSaving'), showLoader: false, type: spinnerType.small };
					if (result.status === responseStatus.APIError && result.messageKey === 'PFUM10002') {
						//vm.showLicenseErrorMessage.emit(true); // No License available
						this.userDetail.assignedLicense = false;
						this.isNoLicenseMessageShown = true;
					}
					else
					{
						vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
					}

				}
			},
				(error: IResponse<any>) => {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('Users'), footerMessage: vm.translateService.instant('UsersSaving'), showLoader: false, type: spinnerType.small };
					vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				}
			);
		};
	}

	ngOnInit() {
		this.reset();
	}
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
