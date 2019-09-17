import { Component, Inject, Input, OnInit, OnDestroy } from '@angular/core';
import { IResponse, IApp, IKeyData, IRoleWithApps, IUserAccess } from '../models/viewModels';
import { IApplicationService, IMessageService, ISortService, IBroadcastService, IStorageService, ICommonService } from '../interfaces/interfaces';
import { responseStatus, opMode, messageType, sortOrder, page } from '../models/enums';
import { ENV_APP_MAP } from '../config/appMap/appMap';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Rx';

@Component({
	selector: 'sp3-comp-applications',
	templateUrl: './application.control.html'
})

export class SpApplicationsComponent implements OnInit, OnDestroy {
	@Input() public controlId: string;
	@Input() public mode: opMode;
	@Input() public allowNavigate: boolean;
	@Input() public showAllApps: boolean;
  @Input() public showSelect: boolean;
	@Input() public allowSelect: boolean;
	@Input() public showNoAppMessage: boolean;
	@Input() public allowCollapse?: boolean = true;
	@Input() public selectedApps?: IApp[] = [];
  @Input() public totalApplications?: IApp[] = [];  
	@Input() public hasSelectedApps?: boolean = true;
	applications: IApp[] = [];
	applicationsTemp: IApp[] = [];
	selectedAppsCount: number = 0;

	getApplications: () => void;
	isSelected: (app: IApp) => void;
	isUnSelected: (app: IApp) => void;
	IsCollapsed: (isCollapsed: boolean) => void;
	ngUnsubscribe: Subject<any> = new Subject<any>();
	onAppSelect: (app: IApp, iconType: boolean) => void;
  onAppNavigate: (app: IApp) => void;
	getActiveApps: (appList: IApp[]) => IApp[];
	expanded: boolean = true;
	appDetails: any;
	ngOnInit() {
		var vm = this;
		vm.getApplications();
	}

	ngOnDestroy() {
		var vm = this;
		vm.selectedApps = [];
		vm.applications = [];
		vm.showNoAppMessage = false;
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	constructor( @Inject('IApplicationService') public applicationService: IApplicationService,
		@Inject('IMessageService') public messageService: IMessageService,
    @Inject('ISortService') public sortService: ISortService,
    @Inject('IStorageService') private storageService: IStorageService,
		private router: Router,
		@Inject('ICommonService') private commonService: ICommonService,
		@Inject('IBroadcastService') private broadcastService: IBroadcastService) {
		var vm = this;
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			if (vm.controlId === result.key) {
				if (vm.hasSelectedApps) {
					vm.selectedApps = result.data;
					if (!vm.showAllApps) {
						if ((!vm.selectedApps || vm.selectedApps.length === 0)) {
							vm.applications = vm.selectedApps;
							if (vm.showNoAppMessage) {
								vm.messageService.Message = { message: 'AppsNotAssigned', showMessage: true, type: messageType.Error };
							}
							else {
								if (vm.messageService.Message.message === 'AppsNotAssigned') {
									vm.messageService.Message = { message: '', showMessage: false, type: messageType.Error };
								}
							}
						}
						else {
							vm.applications = sortService.sort(vm.selectedApps, 'name', sortOrder.Asc);
						}
					}
					vm.selectedAppsCount = vm.selectedApps ? vm.selectedApps.length : 0;
				}
			}
		});

		vm.getApplications = () => {
			messageService.Message = { message: '', showMessage: false, type: messageType.Error };
			if (vm.showAllApps) {
				vm.applicationService.getApplications().takeUntil(this.ngUnsubscribe).subscribe(result => {
					if (result.status === responseStatus.Success) {
						vm.applications = vm.getActiveApps(result.data);
					}
					else {
						messageService.Message.showMessage = true;
						messageService.Message.message = result.messageKey;
					}
				},
					(error: IResponse<any>) => {
						messageService.Message.showMessage = true;
						messageService.Message.message = error.messageKey;
					}
				);
			}
			else {
				vm.applications = sortService.sort(vm.selectedApps, 'name', sortOrder.Asc);
				vm.selectedAppsCount = vm.selectedApps ? vm.selectedApps.length : 0;
      }
    };
		vm.onAppSelect = (app: IApp, iconType: boolean) => {
			if (!vm.showSelect || !vm.allowSelect) {
				return;
			}
			var index = exists(app);
			if (iconType) {
				if (index > -1) {
					vm.selectedApps.splice(index, 1);
				}

			}
			else {
				if (index === -1) {
					vm.selectedApps.push(app);
				}

			}

			if (vm.selectedApps) {
				vm.selectedAppsCount = vm.selectedApps.length;
			}


			vm.broadcastService.broadcast(vm.controlId + 'AppsChanged', vm.selectedApps);
		};

		vm.isUnSelected = (app: IApp) => {
			if (!vm.showSelect) {
				return false;
			}


			if (vm.selectedApps) {
				return (exists(app) === -1);
			}

			else {
				return true;
			}

		};

		vm.isSelected = (app: IApp) => {
			if (!vm.showSelect) {
				return false;
			}


			if (vm.selectedApps) {
				return (exists(app) > -1);
			}

			else {
				return false;
			}

		};
		function exists(app: IApp): number {
			for (var i = 0; i < vm.selectedApps.length; i++) {
				if (vm.selectedApps[i].id === app.id) {
					return i;
				}
			}
			return -1;
		}

		vm.IsCollapsed = (isCollapsed: boolean) => {
			vm.expanded = !isCollapsed;
		};

		vm.onAppNavigate = (app: IApp) => {
			if (!vm.allowNavigate) {
				return;
			}
			vm.storageService.clearItem('selectedApp');
			vm.storageService.clearItem('selectedTab');
			vm.storageService.clearItem('IsFromIA');
			vm.storageService.setItem('appName', app.code);
			vm.broadcastService.broadcast('appSelected', app.code);
			switch (app.code) {
				case ENV_APP_MAP.dashboard:
					vm.router.navigate(['dashboard']);
					//window.location.href = '/dashboard';
					break;
				case ENV_APP_MAP.case:
					vm.router.navigate(['caseView']);
					break;
				case ENV_APP_MAP.settings:
					vm.router.navigate(['settings']);
					break;
				case ENV_APP_MAP.arrivals:
					vm.router.navigateByUrl('arrivals');
					break;

				case ENV_APP_MAP.decisionCenter:
					vm.storageService.setItem('appName', 'DecisionCentre');
					vm.router.navigate(['DecisionCentre']);
					break;
				case ENV_APP_MAP.analyzer:
					vm.router.navigate(['IA']);
					break;
				case ENV_APP_MAP.inspection:
					vm.storageService.setItem('appName', 'Inspection');
					vm.router.navigate(['Inspection']);
					break;
				case ENV_APP_MAP.scanner:
					vm.router.navigate(['ScanManagement']);
					break;
				default:
					break;
			}
		};
		vm.getActiveApps = (appsList: IApp[]) => {
			let activeApps: IApp[] = [];
			for (let app in appsList) {
				if (appsList[app].status === 1) {
					activeApps.push(appsList[app]);
				}
			}
			activeApps = sortService.sort(activeApps, 'name', sortOrder.Asc);
			return activeApps;
		};
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			if (result.key === page.role.toString() || result.key === page.user.toString()) {
				vm.getApplications();
			}
			if (result.key === 'roleData') {
				this.applicationsTemp = [];
        this.appDetails = result.data;
				setTimeout(() => {
          let locationValue = +localStorage.getItem('locationValue');
          let userRole = JSON.parse(sessionStorage.getItem('userRoles'));
          if(userRole){
            userRole.forEach(item => {
              if(item.locationId===locationValue){
                item.apps.forEach(app => {
                   if (this.exists(app) === -1) {
                      this.applicationsTemp.push(app);
                   }
                });
              }
            });
          }
          vm.applications = sortService.sort(this.applicationsTemp, 'name', sortOrder.Asc);
          if(this.commonService && this.commonService.UserAccess){
              let userRole : IRoleWithApps = this.commonService.UserAccess.role;
              userRole.apps = JSON.parse(JSON.stringify(vm.applicationsTemp));
              this.commonService.UserAccess = { userId: this.commonService.UserAccess.userId, role: userRole } as IUserAccess;
          }
				},50);
			}
		});
	}
	exists(app: IApp): number {
		for (var i = 0; i < this.applicationsTemp.length; i++) {
			if (this.applicationsTemp[i].id === app.id) {
				return i;
			}
		}
		return -1;
  }
}
