import { Component, Inject,OnDestroy, OnInit } from '@angular/core';
import { IApp, IKeyValue, IRoleWithApps, IAppDetail ,IKeyData, IResponse } from '../../models/viewModels';
import { Subject } from 'rxjs/Rx';
import { IBroadcastService,  IMessageService, IApplicationService, ITranslateService, IGeneralSettings } from '../../interfaces/interfaces';
import { action, spinnerType, responseStatus, messageType, metaDataSettings } from '../../models/enums';

@Component({
		selector: 'sp3-comp-application-detail',
		templateUrl: './application.detail.component.html'
})

export class ApplicationDetailComponent implements OnInit, OnDestroy {
		updatedAppDetail: IAppDetail = {
				id: 0, appAdded: '', appCode: '', appLastUpdated: '', appPublished: '', category: '', description: '',
				logourl: '', name: '', roles: null, status: 0, type: '', version: ''
		}; 
		
		appDetail: IAppDetail = null;
		IsSuccess: boolean = false;		
		appId: number;
		appName: string;
		appCode: string;
		createdDate: Date;
		email: string;
		telephone: string;
		appStatus: IKeyValue;
		empStatus: IKeyValue;
		position: string;
		mobile: string;
		isDirty: boolean;
		id: string = 'appEdit';
		appOriginalStatus : IKeyValue;
		userAppsId: string = 'userApps';
		
		statusList: IKeyValue[] = [];
		empStatusList: IKeyValue[] = [];

		userRoles: IRoleWithApps[] = [];
		userRoleApps: IApp[] = [];

		onTextAdded: (text: string) => void;
		onSelectChanged: (selectedValue: IKeyValue) => void;
		sendData: () => void;
		setRoleApps: () => void;
		cancelAppEdit: () => void;
		saveApp: () => void;
		getSaveButtonDisabled:() => void;
		setStatusList: () => void;

    ngUnsubscribe: Subject<any> = new Subject<any>();
		constructor( @Inject('IApplicationService') private appService: IApplicationService,
				@Inject('IBroadcastService') private broadcastService: IBroadcastService,
				@Inject('ITranslateService') public translateService: ITranslateService,
				@Inject('IGeneralSettings') private generalSettingsService: IGeneralSettings,
				@Inject('IMessageService') private messageService: IMessageService)
				{

				var vm = this;

				vm.setStatusList = () => {
					vm.generalSettingsService.fetchStatusMetaData(metaDataSettings[metaDataSettings.Applications].toString()).subscribe(result => {
					if (result.status === responseStatus.Success) {
						vm.statusList = result.data.AppStatus;
						vm.appStatus = vm.statusList[0];
					}
					},
					(error: IResponse<any>) => {					
						vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
					});	
				};

				//vm.statusList = [{ id: 1, name: 'Active' }, { id: 2, name: 'InActive' }];
				//vm.appStatus = vm.statusList[0];
				vm.IsSuccess = false;
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((appDetail: IKeyData) => {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage:  vm.translateService.instant('ApplDetailLoading'), showLoader: true, type: spinnerType.small };
						if (appDetail !== null && appDetail.key === 'appDetails' && appDetail.data != null) {
								vm.appDetail = appDetail.data;
								if (appDetail.data.status === 1) {
									vm.appStatus = vm.statusList[0];
									vm.appOriginalStatus = vm.statusList[0];
								}
								else {
									vm.appStatus = vm.statusList[1];
									vm.appOriginalStatus = vm.statusList[1];
								}
								vm.IsSuccess = false;
								vm.appDetail.appLastUpdated = vm.appDetail.appLastUpdated;
								vm.appDetail.appPublished =	 vm.appDetail.appPublished;
								vm.appDetail.appAdded = vm.appDetail.appAdded;
								vm.broadcastService.broadcast('selectStyleReset', null);
						}
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage:  vm.translateService.instant('ApplDetailLoading'), showLoader: false, type: spinnerType.small };
				});
				vm.getSaveButtonDisabled = () => {								
					if(vm.messageService.getPageChange(action.appEdit))
					{								
						return false;	
					}				
					return true;
					
				};

				vm.onSelectChanged = (selectedValue: IKeyValue) => {
						vm.appStatus = selectedValue;
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage:  vm.translateService.instant('ApplDetailLoading'), showLoader: true, type: spinnerType.small };
						if (vm.appStatus.id !== vm.appDetail.status) {
								vm.messageService.setPageChange(action.appEdit, true);
								vm.updatedAppDetail.id = vm.appDetail.id;
								vm.updatedAppDetail.status = vm.appStatus.id;
								vm.updatedAppDetail.appAdded = vm.appDetail.appAdded;
								vm.updatedAppDetail.appCode = vm.appDetail.appCode;
								vm.updatedAppDetail.appLastUpdated = vm.appDetail.appLastUpdated;
								vm.updatedAppDetail.appPublished = vm.appDetail.appPublished;
								vm.updatedAppDetail.category = vm.appDetail.category;
								vm.updatedAppDetail.description = vm.appDetail.description;
								vm.updatedAppDetail.logourl = vm.appDetail.logourl;
								vm.updatedAppDetail.name = vm.appDetail.name;
								vm.updatedAppDetail.roles = vm.appDetail.roles;
								vm.updatedAppDetail.type = vm.appDetail.type;
								vm.updatedAppDetail.version = vm.appDetail.version;							
								vm.broadcastService.broadcast(vm.id, vm.updatedAppDetail);								
						}
						else
						{
								//vm.updatedAppDetail = null;
								vm.broadcastService.broadcast('selectStyleReset', null);
								//this.messageService.resetPageChange();							
								vm.messageService.setPageChange(action.appEdit, false); 
								vm.broadcastService.broadcast(vm.id, null);
						}
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage:  vm.translateService.instant('ApplDetailLoading'), showLoader: false, type: spinnerType.small };
				};

				vm.cancelAppEdit = () => {
					if (vm.messageService.showLeaveMessage(action.appEdit)) {
						this.messageService.LeaveMessage = { key: 'Roles', showMessage: true, type: action.appEdit };
					}

				};

				vm.saveApp = () => {
					if (vm.updatedAppDetail != null) {
						vm.IsSuccess = false;
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage: vm.translateService.instant('AppsUpdating'), showLoader: true, type: spinnerType.small };
						vm.appService.updateApplication(vm.updatedAppDetail).subscribe(result => {
							if (result.status === responseStatus.Success) {
								this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage: vm.translateService.instant('AppsUpdating'), showLoader: false, type: spinnerType.small };
								vm.messageService.resetPageChange();
								broadcastService.broadcast('appDetails', result.data);
								this.messageService.resetPageChange();
								vm.broadcastService.broadcast('appUpdated', result.data);
								//vm.selectedFilter = vm.filterList[0];
								//vm.oldFilter = vm.selectedFilter;
								vm.IsSuccess = true;							
								vm.messageService.resetPageChange();
							}
							else {
								this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage: vm.translateService.instant('AppsUpdating'), showLoader: false, type: spinnerType.small };
								vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
							}
						},
							(error: IResponse<any>) => {
								this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage: vm.translateService.instant('AppsUpdating'), showLoader: false, type: spinnerType.small };
								vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
							}
						);

					}
				};
	
				vm.messageService.OperationGoAhead.subscribe(item => {
						if (item && item.operationAllowed && (item.from === action.appEdit || item.from === action.roleTabChange)) {
								this.messageService.resetPageChange();							
								if (vm.appOriginalStatus.id === 1) {
										vm.appStatus = vm.statusList[0];
								}
								else {
										vm.appStatus = vm.statusList[1];
								}
								vm.broadcastService.broadcast('selectStyleReset', null);     
						}
					});

	}
				
	ngOnInit() {				
		this.setStatusList();
	}

    ngOnDestroy(): void {
       this.ngUnsubscribe.next();
       this.ngUnsubscribe.complete();
    }
}
