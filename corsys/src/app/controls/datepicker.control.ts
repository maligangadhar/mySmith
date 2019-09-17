import { Component, Input, ViewChild, Inject, Output, EventEmitter } from '@angular/core';
import { IDatePickerConfig, DatePickerComponent } from 'ng2-date-picker';
import { IStorageService } from '../interfaces/interfaces';
import { IGeneralFormat } from '../models/viewModels';
// import * as moment from 'moment';
// import { SimpleChange } from '@angular/core/src/change_detection/change_detection_util';
@Component({
		selector: 'sp3-comp-datepicker',
		template: `  
		<div class="sp3-datepicker-com">  
			<div class="input-group {{controlClass}}">
		   		<dp-date-picker [(ngModel)]="selectedDate" [required]="true" [config]="config" [theme]="'dp-material'" #datePicker (ngModelChange)="onDateChange()" [disabled]="enablecontrols" id="datePicker"></dp-date-picker>
		   		<span class="input-group-addon" (click)="openCalendar()" id="openCalendarPopup"><i class="fa fa-calendar" aria-hidden="true"></i></span>
		   		<span class="input-group-addon" (click)="clearCalendar()" id="closeCalendarPopup"><i class="fa fa-times" aria-hidden="true"></i></span>
	   		</div>
	 	</div>
	 	<span class="help-block error-msg case-from-msg" *ngIf="isEmpty">{{'Required' | sp3Translate}}</span>`
})
export class SP3DatePickerComponent {

	config: IDatePickerConfig;
	formattedDate: string;
	@Input() public required: boolean;
	@Output() dateChange = new EventEmitter<string>();
	@Input() selectedDate: string;
	@Input() enablecontrols: boolean = false;
	@Input() public controlClass: string;
	isEmpty: boolean;
	@ViewChild('datePicker') datePickerComponent: DatePickerComponent;
	counter: number = 0;
	constructor(@Inject('IStorageService') private storageService: IStorageService){		
    let generalFormat: IGeneralFormat = this.storageService.getItem('generalFormat');
    let currentLang= this.storageService.getItem('currentLang');
		this.config = {
				format: generalFormat.dateFormat,
        disableKeypress: true,
        locale:currentLang
		};
		this.isEmpty = false;
	}
		
		openCalendar() {
			if (this.enablecontrols) {
					return;
			}
			this.datePickerComponent.api.open();
		}

		clearCalendar() {
			if (this.enablecontrols) {
				return;
			}
			this.selectedDate = null;
			this.datePickerComponent._selected = [];
			this.datePickerComponent.inputElementValue = '';
			this.dateChange.emit(''); 
			this.datePickerComponent.api.close();
			this.controlClass = 'alert-warning';
			this.isEmpty = true;
		}


		onDateChange() {
			if (!this.enablecontrols) {
				this.dateChange.emit(this.selectedDate); 
			}
		}
		reset = () => {
			this.controlClass = '';
			this.isEmpty = false;
		}

		/* ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
			for (let prop in changes) {
				if (prop === 'selectedDate') {
					let changedProp = changes['selectedDate'];
					if (!changedProp.firstChange) {
						this.selectedDate = changedProp.currentValue;
					}
				}
			}
		} */
}
