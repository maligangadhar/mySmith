import { Component, Inject, Input, Output, EventEmitter, OnInit ,OnDestroy} from '@angular/core';
import { IKeyValue, IKeyData } from '../models/viewModels';
import { ICommonService, IBroadcastService } from '../interfaces/interfaces';
import {Subject} from 'rxjs/Rx';
@Component({
		selector: 'sp3-comp-dropdown',
		templateUrl: './dropdown.control.html'
})

export class SpDropdownComponent implements OnInit ,OnDestroy{
		@Input() public controlId: string;
		@Input() public selectedValue: IKeyValue;
		@Input() public required: boolean;
		@Input() public size: number;
		@Input() public showTooltip: boolean;

		@Input() public values: IKeyValue[];
		sizeClassLabel: string;
		sizeClassValue: string;
		controlClass: string;
		newValue: IKeyValue = { id: 0, name: '' };
		oldValue: IKeyValue;
		isEmpty: boolean;
    ngUnsubscribe:Subject<any> =new Subject<any>();
		onChange: (event: any) => void;

		@Output() selectedValueChange: any = new EventEmitter();
		@Output() selectedChange: EventEmitter<string>;

		ngOnInit() {
				var vm = this;
				switch (vm.size) {
						case 1: // full
								vm.sizeClassLabel = 'col-sm-5 col-md-5 col-lg-5';
								vm.sizeClassValue = 'col-xs-8 col-sm-7 col-md-7 col-lg-7 tooltips';
								break;
						case 2: // popup
								vm.sizeClassLabel = 'col-sm-4 col-md-5 col-lg-4';
								vm.sizeClassValue = 'col-sm-5 col-md-5 col-lg-6 tooltips';
								break;
						case 3: //custom
								vm.sizeClassLabel = 'col-sm-5 col-md-6 col-lg-4 app-status';
								vm.sizeClassValue = 'col-sm-7 col-md-6 col-lg-8 tooltips';
								break;
						default:
								vm.sizeClassLabel = 'col-sm-5 col-md-5 col-lg-5';
								vm.sizeClassValue = 'col-xs-8 col-sm-7 col-md-7 col-lg-7 tooltips';
								break;
				}
		}
		constructor( @Inject('ICommonService') private commonService: ICommonService,
				@Inject('IBroadcastService') private broadcastService: IBroadcastService) {
				var vm = this;
				vm.oldValue = vm.selectedValue;
				vm.newValue = vm.selectedValue;
				vm.selectedChange = new EventEmitter();
				vm.isEmpty = false;
				vm.showTooltip = true;

				vm.onChange = (data: any) => {
						vm.isEmpty = false;
						if (data === undefined) {
								vm.newValue = { id: 0, name: '' };
						}

						vm.newValue = data;
						if (vm.newValue)
						{
								if (vm.newValue.name && vm.newValue.name.trim().length === 0 && vm.required) {
										vm.controlClass = 'alert-warning';
										if (vm.showTooltip === true){
												vm.isEmpty = true;
										} 
										vm.selectedChange.emit(data);
										return;
						}
						else if (vm.newValue !== vm.oldValue) {
								vm.controlClass = 'alert-success';
						}
						else {
								//vm.controlClass = "alert-black";
								vm.controlClass = '';
						}

				}

						vm.selectedValue = data;

						vm.selectedChange.emit(data);
						vm.selectedValueChange.emit(data);
						vm.selectedValue = data;
				};

				vm.commonService.NewRoleAddedChange.subscribe((result: boolean) => {
						if (result === true) {
								vm.controlClass = '';
						}
				});
        vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((appDetail: IKeyData) => {
						if (appDetail !== null && appDetail.key === 'appDetails') {
							vm.controlClass = '';
						}
			  });
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
						if (result.key === vm.controlId) {
								vm.showTooltip = true;
								vm.onChange(result.data);
								vm.showTooltip = false;
						}
						else if (result.key === 'appEdit') {
								if (result.data === false) {
										vm.controlClass = '';
										vm.isEmpty = false;
								}
						}
						else if (result.key === 'userView') {
								vm.controlClass = '';
								vm.isEmpty = false;
						}
						else if (result.key === 'roleView') {
								vm.controlClass = '';
								vm.isEmpty = false;
						}
						else if (result.key === 'roleEdit' && result.data === null) {
								vm.controlClass = '';
								vm.isEmpty = false;
						}
						else if (result.key === 'generalEdit') {
								vm.controlClass = '';
								vm.isEmpty = false;
						}
						else if (result.key === 'filterChange') {
								vm.controlClass = '';
								vm.isEmpty = false;
						}

						if (result.key === 'selectStyleReset') {
								vm.controlClass = '';
								vm.isEmpty = false;
						}
				});
    }
    ngOnDestroy(): void {
      this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
