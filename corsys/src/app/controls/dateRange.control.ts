
import { IMyDateRangeModel } from '@corsys/daterangepicker';
import { Component, Input, Inject, OnInit } from '@angular/core';
import { IStorageService, ITranslateService } from '../interfaces/interfaces';
import { IGeneralFormat } from '../models/viewModels';
@Component({
		selector: 'sp3-comp-daterangepicker',
		template: `<div>
		<form #myForm="ngForm" novalidate>
			<my-date-range-picker [ControlId]="'controlId'" name="mydaterange" [options]="myDateRangePickerOptions"
				[(ngModel)]="model" (dateRangeChanged)="onDateRangeChanged($event)"></my-date-range-picker>
			</form>
		</div>`
})
export class SpDateRangeComponent implements OnInit {
	
		@Input() dateRange?: Function;
		@Input() ControlId: any;
		generalFormat: IGeneralFormat = {dateFormat: '', timeFormat: '', language: 0};
		myDateRangePickerOptions = {};
		constructor(@Inject('IStorageService') private storageService: IStorageService,	@Inject('ITranslateService') private translateService: ITranslateService,){}
		/* public  myDateRangePickerOptions: IMyDrpOptions = {
				dateFormat: this.generalFormat.dateFormat,
				editableDateRangeField: false
		}; */

		// For example initialize to specific date (09.10.2018 - 19.10.2018). It is also possible
		// to set initial date range value using the selDateRange attribute.
		public model: Object = {
				beginDate: null,
				endDate: null
		};
		onDateRangeChanged(event: IMyDateRangeModel) {
				this.dateRange(event);
		}

		ngOnInit(): void {
      let dayLabel={su: this.translateService.instant('Sunday'),mo:this.translateService.instant('Monday') , tu: this.translateService.instant('Tuesday'),we: this.translateService.instant('Wednesday'), th: this.translateService.instant('Thursday'), fr: this.translateService.instant('Friday'), sa: this.translateService.instant('Saturday')};
      let monthLabels={ 
			1: this.translateService.instant('Jan'),
			2:this.translateService.instant('Feb'),
			3:this.translateService.instant('Mar'),
			4:this.translateService.instant('Apr'),
			5:this.translateService.instant('May'),
			6:this.translateService.instant('Jun'),
			7:this.translateService.instant('July'),
			8:this.translateService.instant('Aug'),
			9:this.translateService.instant('Sep'),
			10:this.translateService.instant('Oct'),
			11:this.translateService.instant('Nov'),
			12:this.translateService.instant('Dec')};
      let dateFormat:IGeneralFormat = this.storageService.getItem('generalFormat');
      let selectBeginDateTxt=this.translateService.instant('SelectBeginDate');
      let selectEndDateTxt =this.translateService.instant('SelectEndDate');
			this.myDateRangePickerOptions  = { dateFormat: dateFormat.dateFormat, editableDateRangeField: false,dayLabels:dayLabel,monthLabels:monthLabels,showSelectDateText :true,selectBeginDateTxt:selectBeginDateTxt,selectEndDateTxt:selectEndDateTxt};
		}
}
