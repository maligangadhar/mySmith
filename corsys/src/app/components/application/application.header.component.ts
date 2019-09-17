import { Component, Inject, OnDestroy } from '@angular/core';

import { IKeyValue, IRole, IAppDetail, IKeyData } from '../../models/viewModels';

import { IBroadcastService, IMessageService, ITranslateService } from '../../interfaces/interfaces';
import { action, page } from '../../models/enums';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Rx';
@Component({
	selector: 'sp3-comp-application-header',
	templateUrl: './application.header.component.html'
})

export class ApplicationHeaderComponent implements OnDestroy {
	filterList: IKeyValue[] = [];
	selectedFilter: IKeyValue;
	IsSuccess: boolean;
	IsSaveDisabled: boolean = true;
	IsCancelDisabled: boolean = true;
	appDetail: IAppDetail = null;
	oldFilter: IKeyValue;
	selectedValueFilter: IKeyValue;
	updatedAppDetail: IAppDetail = null;
	userRoles: IRole[];
	id: string = 'appEdit';
	cancelAppEdit: () => void;
	saveApp: () => void;
	ngUnsubscribe: Subject<any> = new Subject<any>();
	onAppStatusFilterChange: (selectedValue: IKeyValue) => void;
	appSearchFormControl = new FormControl();
	constructor( @Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('ITranslateService') public translateService: ITranslateService) {
		var vm = this;
		vm.appSearchFormControl.valueChanges.debounceTime(400)
			.subscribe((newValue: string) => {
				vm.broadcastService.broadcast('appSearchPublish', { 'eventMessage': newValue });
			});
		vm.filterList = [{ id: 0, name: vm.translateService.instant('AllApps') }, { id: 1, name: vm.translateService.instant('ActiveApps') }, { id: 2, name: vm.translateService.instant('InactiveApps') }];
		vm.selectedFilter = vm.filterList[0];
		vm.oldFilter = vm.selectedFilter;
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((appFilter: IKeyData) => {
			if (appFilter !== null && appFilter.key === 'appFilter') {
				if (vm.selectedFilter.id !== appFilter.data) {
					vm.selectedFilter = vm.filterList[appFilter.data];
				}
			}
		});
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe(eventMessage => {
			if (eventMessage.key === page.applications.toString()) {
				vm.appSearchFormControl.patchValue('', { emitEvent: false });
				vm.broadcastService.broadcast('appSearchPublish', { 'eventMessage': '' });
			}
		});
		vm.onAppStatusFilterChange = (selectedValue: IKeyValue) => {
			vm.broadcastService.broadcast('filterChange', null);
			broadcastService.broadcast('appFilter', selectedValue.id);

		};


		vm.onAppStatusFilterChange = (selectedValue: IKeyValue) => {
			vm.selectedValueFilter = selectedValue;

			if (this.messageService.showLeaveMessage(action.appEdit)) {
				broadcastService.broadcast('isFilterChanged', true);
				this.messageService.LeaveMessage = { key: 'Applications', showMessage: true, type: action.appEdit };
			}
			else {
				vm.broadcastService.broadcast('filterChange', null);
				broadcastService.broadcast('appFilter', vm.selectedValueFilter.id);
				vm.oldFilter = vm.selectedValueFilter;
			}

		};
		this.messageService.OperationGoAhead.subscribe(item => {
			vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((filterDetails: IKeyData) => {
				if (filterDetails !== null && filterDetails.key === 'isFilterChanged') {
					if (item.operationAllowed && filterDetails.data === true) {
						vm.broadcastService.broadcast('filterChange', null);
						broadcastService.broadcast('appFilter', vm.selectedValueFilter.id);
						vm.oldFilter = vm.selectedValueFilter;
						broadcastService.broadcast('isFilterChanged', false);
					}
					else {
						vm.selectedFilter = vm.oldFilter;
					}
				}
			});

		});
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((appDetail: IKeyData) => {
			if (appDetail !== null && appDetail.key === 'appDetails' && appDetail.data != null) {
				vm.IsSuccess = false;
				this.appDetail = appDetail.data;
				vm.IsSaveDisabled = true;
				vm.IsCancelDisabled = true;
			}
		});
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			if (result.key === vm.id) {
				if (result.data !== null) {
					vm.IsSaveDisabled = false;
					vm.IsCancelDisabled = false;
					vm.updatedAppDetail = result.data;
				}
				else {
					vm.IsSaveDisabled = true;
					vm.IsCancelDisabled = true;
					vm.updatedAppDetail = null;
				}
			}

		});
	
	}
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
