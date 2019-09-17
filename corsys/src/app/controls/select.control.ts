import { Component, Inject, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IKeyValue, IKeyData } from '../models/viewModels';
import { ICommonService, IBroadcastService } from '../interfaces/interfaces';
import { Subject } from 'rxjs/Rx';
@Component({
	selector: 'sp3-comp-select',
	templateUrl: './select.control.html'
})

export class SpSelectComponent implements OnInit, OnDestroy {
	@Input() public labelText: string;
  @Input() public controlId: string;
  @Input() public tooltip: string;
	@Input() public selectedValue: IKeyValue;
	@Input() public required: boolean;
	@Input() public size: number;
	@Input() public showTooltip: boolean;
	@Input() public isDisabled: boolean = false;
	@Input() public values: IKeyValue[];
	sizeClassLabel: string;
	sizeClassValue: string;
	@Input() public controlClass: string;
	newValue: IKeyValue = { id: 0, name: '' };
	oldValue: IKeyValue;
	isEmpty: boolean;
	ngUnsubscribe: Subject<any> = new Subject<any>();
	onChange: (event: any) => void;
	reset: () => void;
	@Output() selectedValueChange: any = new EventEmitter();
	@Output() selectedChange: EventEmitter<string>;

	ngOnInit() {
		var vm = this;
		switch (vm.size) {
			case 1: // full
				vm.sizeClassLabel = 'col-sm-4';
				vm.sizeClassValue = 'col-sm-8 ';
				break;
			case 2: // popup
				vm.sizeClassLabel = 'col-sm-4';
				vm.sizeClassValue = 'col-sm-8';
				break;
			case 3: //custom
				vm.sizeClassLabel = 'col-sm-4 app-status';
				vm.sizeClassValue = 'col-sm-8';
				break;
			case 4: //custom
				vm.sizeClassLabel = 'col-sm-4 casecancellabel';
				vm.sizeClassValue = 'col-sm-8';
				break;
			case 5:
				vm.sizeClassLabel = 'col-sm-4 col-xs-4';
				vm.sizeClassValue = 'col-xs-8 col-sm-8';
				break;
			case 6:
				vm.sizeClassLabel = '';
				vm.sizeClassValue = '';
				break;
			case 7:
				vm.sizeClassLabel = 'col-sm-12';
				vm.sizeClassValue = 'col-sm-12';
				break;
			default:
				vm.sizeClassLabel = 'col-sm-4 cCase';
				vm.sizeClassValue = 'col-sm-8';
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
			if (vm.newValue) {
				if ((vm.newValue.name.trim().length === 0 || vm.newValue.id === -1) && vm.required) {
					vm.controlClass = 'alert-warning';
					if (vm.showTooltip === true) {
						vm.isEmpty = true;
					}
					vm.selectedChange.emit(data);
					vm.selectedValueChange.emit(data);
					return;
				}
				else if (vm.newValue !== vm.oldValue) {
					vm.controlClass = 'alert-success';
				}
				else {
					//vm.controlClass = "alert-black";
					vm.controlClass = '';
				}


				vm.selectedValue = data;

				vm.selectedChange.emit(data);
				vm.selectedValueChange.emit(data);
				vm.selectedValue = data;
			}
		};

		vm.reset = () => {
			vm.controlClass = '';
			vm.isEmpty = false;
		};

		vm.commonService.NewRoleAddedChange.subscribe((result: boolean) => {
			if (result === true) {
				vm.controlClass = '';
			}
		});

		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((appDetail: IKeyData) => {
			if (appDetail.key === 'appDetails') {
				vm.controlClass = '';
			}
		});

		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
					/*if (result.key === vm.controlId) {
							vm.showTooltip = true;
							vm.onChange(result.data);
							vm.showTooltip = false;
					} */
					if (result.key === 'appEdit') {
							if (result.data === false) {
									vm.reset();
							}
					}
					else if (result.key === 'userView' || result.key === 'userUpdated') {
							vm.reset();
					}
					else if (result.key === 'roleView') {
							vm.reset();
					}
					else if (result.key === 'roleEdit' && result.data === null) {
							vm.reset();
					}
					else if (result.key === 'generalEdit') {
							vm.reset();
					}
					else if (result.key === 'filterChange') {
							vm.controlClass = '';
							vm.isEmpty = false;
					}
					/*else if (result.key === broadcastKeys[broadcastKeys.refreshCaseList]) {
							vm.controlClass = '';
					} */
					if (result.key === 'selectStyleReset') {
							vm.reset();
					}

					if (result.key === 'nationalityReset')
					{
							vm.controlClass = '';

					}

			});
	}
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
