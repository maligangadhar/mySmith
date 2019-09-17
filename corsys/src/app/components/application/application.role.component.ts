import { Component, Inject ,OnDestroy} from '@angular/core';
import { IApp, IKeyValue, IRoleWithApps, IAppDetail, IAppRoles ,IKeyData } from '../../models/viewModels';
import { ISortService ,IBroadcastService } from '../../interfaces/interfaces';
import { sortOrder } from '../../models/enums';
import {Subject} from 'rxjs/Rx';
@Component({
		selector: 'sp3-comp-application-role',
		templateUrl: './application.role.component.html'
})

export class ApplicationRoleComponent  implements OnDestroy{
		appsRolesList: IAppRoles[];
		appDetail: IAppDetail = null;
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
		id: string = 'userEdit';
		userAppsId: string = 'userApps';

		statusList: IKeyValue[] = [];
		empStatusList: IKeyValue[] = [];

		userRoles: IRoleWithApps[] = [];
		userRoleApps: IApp[] = [];
    ngUnsubscribe: Subject<any> = new Subject<any>();
		onTextAdded: (text: string) => void;
		onSelectChanged: (selectedValue: IKeyValue) => void;
		sendData: () => void;
		setRoleApps: () => void;

		constructor( @Inject('IBroadcastService') private broadcastService: IBroadcastService, @Inject('ISortService') public sortService: ISortService) {
				var vm = this;
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((appDetail: IKeyData) => {
					  vm.appDetail = null;
						if (appDetail !== null && appDetail.key === 'appDetails' && appDetail.data != null) {
								vm.appDetail = appDetail.data;
								vm.appsRolesList = appDetail.data.roles;
								vm.appsRolesList = sortService.sortCaseIndependent(vm.appsRolesList, 'name', sortOrder.Asc);
						}else{
							this.appDetail = null;
						}
				});		
    }
    ngOnDestroy(): void {
       this.ngUnsubscribe.next();
       this.ngUnsubscribe.complete();
    }
}   
