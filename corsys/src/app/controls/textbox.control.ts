import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { ICommonService, IBroadcastService } from '../interfaces/interfaces';
import { broadcastKeys } from '../models/enums';
import { IKeyData } from '../models/viewModels';

@Component({
	selector: 'sp3-comp-textbox',
	templateUrl: './textbox.control.html'
})

export class SpTextboxComponent implements OnInit{
	@Input() public inputType: string = 'text';
	@Input() public labelText: string;
	@Input() public controlId: string;
	@Input() public value: string = '';
	@Input() public required: boolean;
	@Input() public placeholderText: string;
	@Input() public maxLengthValue: number;
	@Output() valueChange: any = new EventEmitter();
	@Input() public size: number;
	@Input() public showTooltip: boolean;
	@Input() public isDisabled: boolean = false;
	@Output() textAdded: EventEmitter<string>;
	@Output() emailValidated: EventEmitter<boolean>;

	updateData(data) {
		this.value = data;
		this.valueChange.emit(data);
	}

	@Input() public controlClass: string;
	newValue: string;
	oldValue: string = '';
	isEmpty: boolean;
	isEmailInValid: boolean;
	isShipIdInValid: boolean;
	isHsCodeValid: boolean;
	isOverallWeight: boolean;
	isContainerIdInValid: boolean;
	sizeClassLabel: string;
	sizeClassValue: string;
	focusFlag: boolean;
	message: string;
	isMessageShown: boolean;

	focusOut: () => void;
	onfocus: () => void;
	GetMaxLengthValue: () => number;
	onFocusOut: () => void;
	setMessage: () => void;
	reset: () => void;

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
				vm.sizeClassLabel = 'col-sm-4';
				vm.sizeClassValue = 'col-sm-8';
				break;
		}
	}

	constructor( @Inject('ICommonService') private commonService: ICommonService, @Inject('IBroadcastService') private broadcastService: IBroadcastService) {
		var vm = this;

		vm.placeholderText = '';
		//vm.inputType = 'text';
		vm.isEmailInValid = false;
		vm.isShipIdInValid = false;
		vm.isOverallWeight = false;
		vm.isContainerIdInValid = false;
		vm.isEmpty = false;
		vm.showTooltip = true;
		vm.focusFlag = false;

		vm.textAdded = new EventEmitter();
		vm.emailValidated = new EventEmitter();

		vm.GetMaxLengthValue = () => {
			return vm.maxLengthValue;
		};

		vm.onfocus = () => {
			if (!vm.focusFlag) {
				vm.oldValue = vm.value;
				vm.focusFlag = true;
			}
		};

		vm.focusOut = () => {
			vm.onFocusOut();
		};

		// tslint:disable-next-line:cyclomatic-complexity
		vm.onFocusOut = () => {
			vm.reset();

			if (vm.value === undefined || vm.value === null) {
				vm.value = '';
			}

			vm.newValue = vm.value;

			if (vm.newValue.trim() === '' && vm.required) {
				vm.controlClass = 'alert-warning';
				if (vm.showTooltip === true) {
					vm.isEmpty = true;
					vm.setMessage();
				}
				vm.textAdded.emit(vm.value);
				return;
			}

			if (vm.inputType === 'email') {
				if (vm.newValue.trim().length !== 0 && !vm.commonService.emailValidator(vm.newValue.trim())) {
					vm.controlClass = 'alert-warning';
					if (vm.showTooltip === true) {
						vm.isEmailInValid = true;
						vm.setMessage();
					}
				}

				vm.emailValidated.emit(vm.isEmailInValid);
				if (vm.isEmailInValid) {
					return;
				}
			}

			if (vm.inputType === 'shipId') {
				if (vm.newValue.trim().length !== 0 && !vm.commonService.shipIdValidator(vm.newValue.trim())) {
					vm.controlClass = 'alert-warning';
					if (vm.showTooltip === true) {
						vm.isShipIdInValid = true;
						vm.setMessage();
					}
				}
				if (vm.isShipIdInValid) { return; }
			}
			if (vm.inputType === 'overallWeight') {
				if (!vm.commonService.overAllWeightValidator(vm.newValue.trim())) {
					vm.controlClass = 'alert-warning';
					if (vm.showTooltip === true) {
						vm.isOverallWeight = true;
						vm.setMessage();
					}
				}
				if (vm.isOverallWeight) { return; }
			}

			if (vm.inputType === 'containerId') {
				if (!vm.commonService.containerIdValidator(vm.newValue.trim())) {
					vm.controlClass = 'alert-warning';
					if (vm.showTooltip === true) {
						vm.isContainerIdInValid = true;
						vm.setMessage();
					}
				}
				if (vm.isContainerIdInValid) { return; }
			}

			if (vm.inputType === 'hsCode') {
				if (vm.newValue.trim().length !== 0 && !vm.commonService.hsCodeValidator(vm.newValue.trim())) {
					vm.controlClass = 'alert-warning';
					if (vm.showTooltip === true) {
						vm.isHsCodeValid = true;
						vm.setMessage();
					}
				}
				if (vm.isHsCodeValid) { return; }
			}


			if (vm.newValue !== vm.oldValue) {
				vm.controlClass = 'alert-success';
			}
			else {
				vm.controlClass = '';
			}

			vm.textAdded.emit(vm.value);
		};

		vm.setMessage = () => {
			vm.isMessageShown = false;
			vm.message = '';

			if (vm.isEmpty) {
				vm.message = 'Required';
				vm.isMessageShown = true;
			}
			else if (vm.isEmailInValid) {
				vm.message = 'InvalidEmail';
				vm.isMessageShown = true;
			}
			else if (vm.isShipIdInValid) {
				vm.message = 'InvalidShipEntry';
				vm.isMessageShown = true;
			}
			else if (vm.isOverallWeight) {
				vm.message = 'InvalidWeightEntry';
				vm.isMessageShown = true;
			}
			else if (vm.isContainerIdInValid) {
				vm.message = 'InvalidContainerIDEntry';
				vm.isMessageShown = true;
			}
		};

		vm.reset = () => {
			vm.controlClass = '';
			vm.isEmpty = false;
			vm.isEmailInValid = false;
			vm.isShipIdInValid = false;
			vm.isHsCodeValid = false;
			vm.isOverallWeight = false;
			vm.isContainerIdInValid = false;
			vm.isMessageShown = false;
			vm.message = '';
		};

		vm.commonService.NewRoleAddedChange.subscribe((result: boolean) => {
			if (result === true) {
				vm.controlClass = '';
			}
		});

		/**
 * This code block is depreciated.  Will be removed as part of Task:- 2992
 */
		vm.broadcastService.DataChange.subscribe((result: IKeyData) => {
			if (result.key === vm.controlId) {
				vm.showTooltip = true;
				vm.onFocusOut();
				vm.showTooltip = false;
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
			else if (result.key === broadcastKeys[broadcastKeys.refreshCaseList]) {
				vm.controlClass = '';
			}

		});

	}
}
