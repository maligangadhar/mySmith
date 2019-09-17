import { Component, Inject, Input, Output, EventEmitter, OnInit,OnDestroy } from '@angular/core';
import { IKeyData } from '../models/viewModels';
import { ICommonService, IBroadcastService } from '../interfaces/interfaces';
import { broadcastKeys } from '../models/enums';
import {Subject} from 'rxjs/Rx';

@Component({
		selector: 'sp3-comp-multi-textbox',
		templateUrl: './multi.text.control.html'
})

export class SpMultiTextboxComponent implements OnInit,OnDestroy{
		@Input() public labelText: string;
		@Input() public controlId: string;
		@Input() public textValue: string = '';
		@Input() public required: boolean;
		@Input() public rows: number;
		@Input() public placeholderText: string;
		@Input() public maxLengthValue: number;
		@Input() public showTooltip: boolean;
		@Input() public toolTip:string='';
		@Input() public inputType: string='';
		@Input() public labelVisible?: boolean = true;
		@Input() public isDisabled: boolean = false;
		public reset: () => void;
		setMessage: () => void;
		isHsCodeValid: boolean=true;
		message: string;
		isMessageShown: boolean;
		@Output() textValueChange: any = new EventEmitter();
		@Output() textAdded: EventEmitter<string>;
    ngUnsubscribe:Subject<any>= new Subject<any>();
		GetMaxLengthValue: () => number;

		updateData(event) {
				this.textValue = event;
				this.textValueChange.emit(event);
		}

		controlClass: string;
		newValue: string;
		oldValue: string = '';
		isEmpty: boolean;
		focusOut: () => void;
		onfocus: () => void;       
		isLabelVisible : () => void;
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
		constructor( @Inject('ICommonService') private commonService: ICommonService, 
		@Inject('IBroadcastService') private broadcastService: IBroadcastService) {
				var vm = this;
				vm.reset = () => {			
					vm.isHsCodeValid = true;
					vm.isMessageShown=false;
					vm.controlClass='';
					vm.message='';	
				};
				vm.placeholderText = '';
				vm.textAdded = new EventEmitter();
				vm.isEmpty = false;

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
							vm.isHsCodeValid = vm.commonService.hsCodeValidator(vm.newValue.trim());
							if (vm.newValue.trim().length !== 0 && !vm.commonService.hsCodeValidator(vm.newValue.trim())) {
								vm.controlClass = 'alert-warning';
								// if (vm.showTooltip === true) {
								// 	//vm.isHsCodeValid = true;
								// 	vm.setMessage();
								// }

							}
							if (vm.isHsCodeValid) {
								vm.isMessageShown=false;
								return; }
							else
							{
								vm.setMessage();
							}
						}
				};
				vm.setMessage = () => {
					vm.isMessageShown = false;
					vm.message = '';
		
					if (!vm.isHsCodeValid) {
							vm.message = 'InvalidHsCodeEntry';
							vm.isMessageShown = true;
					}
				};
				vm.commonService.NewRoleAddedChange.subscribe((result: boolean) => {
						if (result === true) {
								vm.controlClass = '';
						}
				});
				vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
						if (result.key === 'userView') {
								vm.isEmpty = false;
								vm.controlClass = '';
						}
						else if (result.key === 'roleView') {
								vm.isEmpty = false;
								vm.controlClass = '';
						}
						else if (result.key === 'roleEdit' && result.data === null) {
								vm.isEmpty = false;
								vm.controlClass = '';
						}
						else if (result.key === broadcastKeys[broadcastKeys.refreshCaseList]) {
								vm.isEmpty = false;
								vm.controlClass = '';
						}
				});
    }
    ngOnDestroy(): void {
       this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
