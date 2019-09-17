import { Component, Inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ICommonService } from '../interfaces/interfaces';

@Component({
	selector: 'sp3-comp-multitext',
	templateUrl: './multitext.control.html'
})

export class SpMultiTextComponent implements OnInit {
	@Input() public controlId: string;
	@Input() public textValue: string = '';
	@Input() public required: boolean;
	@Input() public rows: number;
	@Input() public placeholderText: string;
	@Input() public maxLengthValue: number;
	@Input() public showTooltip: boolean;
	@Input() public labelVisible?: boolean = true;
	@Input() public isDisabled: boolean = false;
	@Input() public inputType: string='';
	@Output() textValueChange: any = new EventEmitter();
	@Output() textAdded: EventEmitter<string>;
	setMessage: () => void;
	public reset: () => void;
	GetMaxLengthValue: () => number;
	isHsCodeValid: boolean;
	message: string;
	isMessageShown: boolean;

	updateData(event) {
		this.textValue = event;
		this.textValueChange.emit(this.textValue);
	}

	controlClass: string;
	newValue: string;
	oldValue: string = '';
	isEmpty: boolean;
	focusOut: () => void;
	onfocus: () => void;
	isLabelVisible: () => void;
	labelColumnWidth: string = 'col-sm-4 col-md-5 col-lg-5';
	ngOnInit() {
		var vm = this;
		if (!vm.labelVisible) {
			vm.labelColumnWidth = 'col-sm-1 col-md-1';
		}
		else {
			vm.labelColumnWidth = 'col-sm-4 col-md-5 col-lg-5';
		}
	}
	constructor( @Inject('ICommonService') private commonService: ICommonService) {
		var vm = this;
		vm.placeholderText = '';
		vm.textAdded = new EventEmitter();
		vm.isEmpty = false;
		vm.reset = () => {			
			vm.isHsCodeValid = false;	
		};
		vm.GetMaxLengthValue = () => {
			return vm.maxLengthValue;
		};
		vm.isLabelVisible = () => {
			return vm.labelVisible;
		};
		vm.onfocus = () => {
			vm.oldValue = vm.textValue;
		};
		vm.focusOut = () => {
			vm.newValue = vm.textValue;
			vm.isEmpty = false;
			vm.reset();

			vm.textAdded.emit(vm.newValue);
			if (vm.newValue === undefined) {
				vm.newValue = '';
			}
			if (vm.newValue.trim() === '' && vm.required) {
				vm.controlClass = 'alert-warning';
				vm.isEmpty = true;
				return;
			}

			if (vm.newValue !== vm.oldValue) {
				vm.controlClass = 'alert-success';
			}
			else {
				vm.controlClass = '';
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
		};
		vm.setMessage = () => {
			vm.isMessageShown = false;
			vm.message = '';

			if (vm.isHsCodeValid) {
				vm.message = 'InvalidEntry';
				vm.isMessageShown = true;
			}
		};
		vm.commonService.NewRoleAddedChange.subscribe((result: boolean) => {
			if (result === true) {
				vm.controlClass = '';
			}
		});

		/**
		 * This code block is depreciated and will be removed as part of 2992
		 */
		/* vm.broadcastService.DataChange.subscribe((result: IKeyData) => {
				if (result.key === 'userView') {
						vm.controlClass = '';
				}
				else if (result.key === 'roleView') {
						vm.controlClass = '';
				}
				else if (result.key === 'roleEdit' && result.data === null) {
						vm.controlClass = '';
				}
				else if (result.key === 'caseNotesReset')
				{
						vm.controlClass = '';
				}
		}); */
	}
}
