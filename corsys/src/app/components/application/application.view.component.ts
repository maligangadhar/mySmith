import { Component, Inject, OnInit, EventEmitter, Output ,OnDestroy} from '@angular/core';
import { IResponse, IApp, IAppDetail, IKeyValue, IKeyData } from '../../models/viewModels';
import { IApplicationService, IMessageService, ISortService, IBroadcastService, ITranslateService} from '../../interfaces/interfaces';
import { responseStatus, messageType, sortOrder, action, spinnerType } from '../../models/enums';
import { Subscription } from 'rxjs/Subscription';
import { FilterAppListContentPipe } from '../../pipes/filterAppContentPipe';
import { Subject } from 'rxjs/Rx';
@Component({
		selector: 'sp3-comp-application-view',
		templateUrl: './application.view.component.html'
}) 

export class ApplicationViewComponent implements OnInit ,OnDestroy {
		title: string;
		getApplications: () => void;
		isAppSelectionChanged: boolean = false;
		searchListOnFilterChange: IApp[] = [];
		filteredStatus: number;
		selAppFilter: number;
		appSelected: IAppDetail;
		oldAppId: number = 0;
		getFilteredList : (filter: number) => void;
		listSelectedApp: IApp;
		updatedAppId: number = 0;
		appsList: IApp[] = [];
		filteredAppsList: IApp[] = [];
		allAppsListFiltered: IApp[] = [];
		activeAppsListFiltered: IApp[] = [];
		inActiveAppsListFiltered: IApp[] = [];
		message: string;
		showError: boolean;
		filterValue: number = 0;
		selApp: IKeyValue;
		selectedApp: IKeyValue;
		onAppSelectionChange: (event: any) => void;
		appSelectionChange: () => void;
		isDataChanged: boolean = false;
		appFilterChange: () => void;
		searchCriteria: any;
		subscription: Subscription;
		searchFilteredArray: IApp[] = [];    
		toggleDataFound: boolean = false;
		viewListHeight: number = window.innerHeight - 230;
		ngUnsubscribe: Subject<any> = new Subject<any>();
		ngOnInit() {
				let vm = this;
				vm.getApplications();
		}

		@Output()
		cardDisplayUpdate = new EventEmitter<boolean>();

		constructor( @Inject('IApplicationService') private appService: IApplicationService,
				@Inject('IMessageService') private messageService: IMessageService,
				@Inject('IBroadcastService') private broadcastService: IBroadcastService,
				@Inject('ITranslateService') public translateService: ITranslateService,
				@Inject('ISortService') public sortService: ISortService) {
				var vm = this;
				window.addEventListener('orientationchange', function() {
					vm.viewListHeight = window.innerHeight - 230;
				  });
				let filterPipe = new FilterAppListContentPipe();
				vm.subscription = vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe(iMessage => {
						if (iMessage.key === 'appSearchPublish') {
								vm.searchCriteria = iMessage.data.eventMessage;
								vm.searchFilteredArray = filterPipe.transform(vm.filteredAppsList, iMessage.data.eventMessage);
								if (vm.searchFilteredArray.length) {
										vm.listSelectedApp = vm.searchFilteredArray[0];
										vm.onAppSelectionChange(vm.listSelectedApp);
										vm.cardDisplayUpdate.emit(true);
										vm.toggleDataFound = false;

								} else {
										//vm.sharedApp.setAppDetail(null);
										broadcastService.broadcast('appDetails', null);
										vm.cardDisplayUpdate.emit(false);
										vm.toggleDataFound = true;
								}
						}


				});
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
						if (result.key === 'appUpdated')
						{
								vm.updatedAppId = result.data.id;
								vm.getApplications();								
								//vm.sharedApp.setAppFilter(0);
								//vm.onAppSelectionChange(result.data);
								//vm.listSelectedApp = vm.filteredAppsList[Object.keys(vm.filteredAppsList).find(k => vm.filteredAppsList[k].id === result.data.id)];
								//vm.sharedApp.setAppDetail(result.data);
								broadcastService.broadcast('appDetails', result.data);
						}
				});

				vm.getFilteredList = (appFilter: number) => {
						vm.filteredAppsList = [];
						switch (appFilter) {
								case 0: vm.filteredAppsList = vm.allAppsListFiltered;
										break;
								case 1: vm.filteredAppsList = vm.activeAppsListFiltered;
										break;
								case 2: vm.filteredAppsList = vm.inActiveAppsListFiltered;
										break;
								default: vm.filteredAppsList = vm.allAppsListFiltered;
										break;
						}

				};
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((appDetail: IKeyData) => {
						if (appDetail !== null && appDetail.key === 'appDetails') {
							if(appDetail.data != null)
							{
								vm.oldAppId = appDetail.data.id;
							}								
						}
						if (appDetail !== null && appDetail.key === 'appFilter') {
								vm.selAppFilter = appDetail.data;
								vm.appFilterChange();
						}
				});
				vm.appFilterChange = () => {
						vm.getFilteredList(vm.selAppFilter);
						vm.searchListOnFilterChange = filterPipe.transform(vm.filteredAppsList, vm.searchCriteria);
						if (vm.searchListOnFilterChange[0]) {
								vm.listSelectedApp = vm.searchListOnFilterChange[0];
								vm.onAppSelectionChange(vm.searchListOnFilterChange[0]);
								vm.cardDisplayUpdate.emit(true);
								vm.toggleDataFound = false;
						}
						else {
								//vm.sharedApp.setAppDetail(null);
								broadcastService.broadcast('appDetails', null);
								vm.cardDisplayUpdate.emit(false);
								vm.toggleDataFound = true;
						}
				};



				vm.getApplications = () => {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage:  vm.translateService.instant('ApplDetailLoading'), showLoader: true, type: spinnerType.small }; 
						vm.activeAppsListFiltered = [];
						vm.inActiveAppsListFiltered = [];
						vm.filteredAppsList = [];
						vm.allAppsListFiltered = [];
						vm.appsList = [];
						vm.message = '';
						vm.showError = false;
						vm.appService.getApplications().subscribe(result => {
								if (result.status === responseStatus.Success) {
										if (!result.data || result.data.length === 0) {
												vm.messageService.Message = { message: 'UsersNotExist', showMessage: true, type: messageType.Error };
										}
										else {

												if (result.data.length > 0) {
														vm.appsList = result.data;
												}

												for (var app in vm.appsList) {
														if (vm.appsList[app].status === 1) {
																vm.activeAppsListFiltered.push(vm.appsList[app]);
														}
														else if (vm.appsList[app].status === 2) {
																vm.inActiveAppsListFiltered.push(vm.appsList[app]);
														}
												}
												vm.filteredAppsList = sortService.sortCaseIndependent(vm.appsList, 'name', sortOrder.Asc);
												vm.activeAppsListFiltered = sortService.sortCaseIndependent(vm.activeAppsListFiltered, 'name', sortOrder.Asc);
												vm.inActiveAppsListFiltered = sortService.sortCaseIndependent(vm.inActiveAppsListFiltered, 'name', sortOrder.Asc);
												vm.allAppsListFiltered = vm.filteredAppsList;

												if(vm.selAppFilter)
												{												
													vm.getFilteredList(vm.selAppFilter);
												}
												//vm.filteredAppsList = [];
												if (vm.updatedAppId !== 0 && vm.filteredAppsList.length > 0)
												{												
													vm.listSelectedApp = vm.filteredAppsList[Object.keys(vm.filteredAppsList).find(k => vm.filteredAppsList[k].id === vm.updatedAppId)];
													if(!vm.listSelectedApp)
													{
														vm.listSelectedApp = vm.filteredAppsList[0];
														vm.onAppSelectionChange(vm.listSelectedApp);
													}
													
													vm.updatedAppId = 0;								

												}
												else {
														if (vm.filteredAppsList.length > 0) {
																vm.listSelectedApp = vm.filteredAppsList[0];
																vm.onAppSelectionChange(vm.listSelectedApp);
														}
														else {
																//vm.sharedApp.setAppDetail(null);
															broadcastService.broadcast('appDetails',null);
															vm.cardDisplayUpdate.emit(false);
															vm.toggleDataFound = true;
														}
												}
										}
								}
								else {
									this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage:  vm.translateService.instant('ApplDetailLoading'), showLoader: false, type: spinnerType.small }; 
										vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
								}
								this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage:  vm.translateService.instant('ApplDetailLoading'), showLoader: false, type: spinnerType.small }; 
						},
						
								(error: IResponse<any>) => {
										vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
								}
						);
				};

				vm.appSelectionChange = () => {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage:  vm.translateService.instant('ApplDetailLoading'), showLoader: true, type: spinnerType.small }; 
						vm.selectedApp = vm.selApp;
						vm.appService.getApplication(vm.selectedApp.id).subscribe(result => {
								if (result.status === responseStatus.Success) {
										vm.appSelected = result.data;
										broadcastService.broadcast('appDetails', vm.appSelected);
									//	vm.sharedApp.setAppDetail(vm.appSelected);
								}
								else {
									this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage:  vm.translateService.instant('ApplDetailLoading'), showLoader: false, type: spinnerType.small }; 
										vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
								}
						},
								(error: IResponse<any>) => {
										vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };

								}
						);
						this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('AppInformation'), footerMessage: vm.translateService.instant('ApplDetailLoading'), showLoader: false, type: spinnerType.small }; 
				};

				vm.onAppSelectionChange = (event: any) => {
						vm.selApp = event;
						// vm.appSelectionChange();

						//vm.selRole = event;
						if (this.messageService.showLeaveMessage(action.appEdit)) {
								vm.isAppSelectionChanged = true;

								this.messageService.LeaveMessage = { key: 'Applications', showMessage: true, type: action.appEdit };
						}
						else {
								vm.appSelectionChange();
						}


				};

				this.messageService.OperationGoAhead.subscribe(item => {
							if (item.operationAllowed) {
							//   this.sharedRole.IsCancelled = true;
								this.messageService.LeaveMessage = { key: 'Applications', showMessage: false, type: null };
								this.messageService.resetPageChange();

								if (vm.isAppSelectionChanged || item.from === action.appEdit) {
										vm.appSelectionChange();
								}

								//  vm.isRoleFilterChanged = false;
								vm.isAppSelectionChanged = false;
								//vm.broadcastService.broadcast("roleEdit", null);

						}

						else {
									//this.sharedRole.IsCancelled = false;
									if (vm.isAppSelectionChanged) {
											vm.listSelectedApp = vm.filteredAppsList[Object.keys(vm.filteredAppsList).find(k => vm.filteredAppsList[k].id === vm.oldAppId)];
								}

								this.messageService.LeaveMessage = { key: 'Applications', showMessage: false, type: null };

								//vm.isRoleFilterChanged = false;
								vm.isAppSelectionChanged = false;
						}
				});


    }
    ngOnDestroy(): void {
       this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
