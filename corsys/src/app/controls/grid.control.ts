import { Component, Inject, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { GridColumnDirective } from '../directives/grid.column.directive';
import { IStorageService, IMessageService, ITranslateService } from '../interfaces/interfaces';
import { DataTable } from 'primeng/primeng';
import { ILoaderMessage } from '../models/viewModels';
import { spinnerType } from '../models/enums';

@Component({
	selector: 'sp3-comp-grid',
	templateUrl: './grid.control.html'
})
export class GridControlComponent implements OnInit, OnChanges, AfterViewInit {
	@ViewChild('dataTable') dataTable: DataTable;
	@Input() public value: any[];
	@Input() public dataKey: string;
	@Input() valueSelectionChange?: Function;
	@Input() headerCheckboxToggleAllPages?: boolean;
	@Input() lazy?: boolean;
	@Input() scrollable?: boolean = false;
	@Input() public scrollHeightGrid: string;
	@Input() public scrollWidthGrid: string;
	@Input() paginator?: boolean = false;
	@Input() customPaginator?: boolean = false;
	@Input() customRowsPerPage: number = 50;
	@Input() editable?: boolean = false;
	@Input() editFunction?: Function;
	@Input() public frozenWidthGrid?: string;
	@Input() public unFrozenWidthGrid?: string;
	@Input() lazyLoad?: Function;
	@Input() totalRecords: number;
	@Input() public selection: any[];
	@Input() customPaginationLoad?: Function;
	@Input() emptyMessage?: string;
	@Input() isShow: boolean = true;
	@Output() selectionChange: any = new EventEmitter();
	@Input() assignToSelfFunction?: Function;
	public frozenWidth: string;
	public unfrozenWidth: string;
	@Input() public isPrintHidden: boolean = false;
	@Input() public isPrintDisabled: boolean = false;
	@Input() public assignToSelf: boolean = false;
	@Input() public enableAssignToSelf: boolean = false;
	@Input() rowStyleLoad?: Function;
	public selectedValues: any[];
	public editRecord?: any;
	public columns: Array<GridColumnDirective> = [];
	public editRecordOld?: any;
	@ViewChild('GridRefresh') GridRefresh;
	@Output() callBackButtonWidth? = new EventEmitter<any>();
	// custom pagination start
	startActionNumber: number = 1;
	endActionNumber: number =1;
	isLeftArrowDisabled: boolean = true;
	isRightArrowDisabled: boolean = false;
	pageNum: number = 1;
	generalDateFormat: string;
	generalTimeFormat: string;
	generalDateTimeFormat: string;
	loaderMessage: ILoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: true, type: spinnerType.fullScreen };
	constructor( @Inject('IStorageService') storageService: IStorageService,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('ITranslateService') private translateService: ITranslateService) {
		this.generalDateFormat = storageService.getItem('generalFormat').dateFormat;
		if (storageService.getItem('generalFormat').timeFormat) {
			this.generalTimeFormat = (storageService.getItem('generalFormat').timeFormat).replace('tt', 'a');
		}

		this.generalDateTimeFormat = this.generalDateFormat + ' ' + this.generalTimeFormat;
	}

	public applyRowStyle = (rowData: any, rowIndex: number) => {
		if (this.rowStyleLoad) {
			return this.rowStyleLoad(rowData);
		}
		return '';
	}

	public previousButtonClick = () => {
    this.selectedValues = [];
		this.loaderMessage.showLoader = true;
		this.messageService.LoaderMessage = this.loaderMessage;
		this.pageNum = this.pageNum - 1;
		if (this.customPaginationLoad) {
			this.customPaginationLoad(this.pageNum);
    }
    this.startActionNumber=+this.startActionNumber;
		this.endActionNumber = this.startActionNumber - 1;
    this.startActionNumber = (this.endActionNumber - this.customRowsPerPage) + 1;
    this.totalRecords=+this.totalRecords;
		if (this.totalRecords && this.totalRecords > 0 && this.endActionNumber > this.totalRecords) {
			this.endActionNumber = this.totalRecords;
		}
    this.setPaginationButtons();
	}

	public nextButtonClick = () => {
    this.selectedValues = [];
		this.loaderMessage.showLoader = true;
		this.messageService.LoaderMessage = this.loaderMessage;
    this.pageNum = this.pageNum + 1;
    this.endActionNumber=+this.endActionNumber;
		if (this.customPaginationLoad) {
			this.customPaginationLoad(this.pageNum);
		}
		this.startActionNumber = this.endActionNumber + 1;
    this.endActionNumber = (this.startActionNumber + this.customRowsPerPage) - 1;
    this.totalRecords=+this.totalRecords;
		if (this.totalRecords && this.totalRecords > 0  && this.endActionNumber > this.totalRecords) {
			this.endActionNumber = this.totalRecords;
		}
    this.setPaginationButtons();
	}

	setPaginationButtons = () => {
		if (this.startActionNumber === 1) {
			this.isLeftArrowDisabled = true;
		}
		else {
			this.isLeftArrowDisabled = false;
		}

		if (this.totalRecords && this.totalRecords > 0 && this.endActionNumber === this.totalRecords) {
			this.isRightArrowDisabled = true;
		}
		else {
			this.isRightArrowDisabled = false;
		}
	}

	setDefaultPagination = () => {
		this.startActionNumber = 1;
		this.pageNum = 1;
		this.isLeftArrowDisabled = true;
		this.isRightArrowDisabled = false;
    this.endActionNumber = (this.startActionNumber + this.customRowsPerPage) - 1;
    this.totalRecords=+this.totalRecords;
		if (this.totalRecords && this.totalRecords > 0 && this.endActionNumber > this.totalRecords) {
			this.endActionNumber = this.totalRecords;
		}
		this.setPaginationButtons();
	}

	public refreshButtonClick = () => {
		this.selectedValues = [];
		this.dataTable.reset();
		this.setDefaultPagination();
		if (this.customPaginationLoad) {
			this.customPaginationLoad(this.pageNum, true);
		}
	}
	public assignToSelfClick = () => {
		// if(this.assignToSelfFunction)
		// 	{
		this.assignToSelfFunction(this.selectedValues);
		//	}
	}
	// custom pagination end

	public onEditClick = (row: any) => {
		this.editRecord = row;
		this.editRecordOld = Object.assign({}, row);
	}
	public crossClick = (row: any, field: string) => {
		row[field] = '';
	}
	public onSaveClick = (row: any) => {
		this.editFunction(row);
		this.editRecord = null;
	}
	public onCancelClick = (row: any) => {
		for (var i = 0; i < this.columns.length; i++) {
			row[this.columns[i].field] = this.editRecordOld[this.columns[i].field];
		}

		this.editRecord = null;
		this.editRecordOld = null;
	}
	public onGridLazyLoad = (event: any) => {
		this.selectedValues = [];
		if (this.lazyLoad) {
			this.setDefaultPagination();
			this.lazyLoad(event);
		}
	}
	public onSelect = (event: any) => {

		this.selectionChange.emit(this.selectedValues);
		if (this.selectedValues.length === 0) {
			this.isPrintDisabled = true;
		}
		else {
			this.isPrintDisabled = false;
		}
		if (this.valueSelectionChange) {
			this.valueSelectionChange(this.selectedValues);
		}

	}
	ngOnInit() {
		if (this.scrollable && this.frozenWidthGrid) {
			this.frozenWidth = this.frozenWidthGrid;
			this.unfrozenWidth = (window.screen.width - 300).toString() + 'px';
		}
		else {
			this.frozenWidth = '0px';

			this.unfrozenWidth = (window.screen.width - 50).toString() + 'px';
		}
		if (this.emptyMessage === undefined || this.emptyMessage === null) {
			this.emptyMessage = this.translateService.instant('NoRecordsFound');
		}
	}

	ngAfterViewInit() {
		if (this.GridRefresh != undefined) {
			this.callBackButtonWidth.emit(this.GridRefresh.nativeElement.clientWidth);
		}

	}

	ngOnChanges(changes: SimpleChanges) {
		this.totalRecords=+this.totalRecords;

		if (this.customPaginator === true && this.totalRecords > 0) {
			if (changes['value']) {
        this.endActionNumber=this.value.length * this.pageNum;
				let chng = changes['value'];
				let prev = JSON.stringify(chng.previousValue);
				if (prev === '[]') {
					this.setDefaultPagination();
				}
				else {
					this.endActionNumber = (this.startActionNumber + this.customRowsPerPage) - 1;
					if (this.endActionNumber > this.totalRecords) {
						this.endActionNumber = this.totalRecords;
					}
        }
      }
      if (changes['totalRecords']) {
				this.endActionNumber = (this.startActionNumber + this.customRowsPerPage) - 1;

        if (this.endActionNumber > this.totalRecords) {
          this.endActionNumber = this.totalRecords;
				}

				if(this.startActionNumber > this.endActionNumber){
					this.startActionNumber = 1;
				}
      }
      this.setPaginationButtons();
		}
	}

	public addColumn(column: GridColumnDirective) {
		this.columns.push(column);
	}

	public checkRiskColor(value:string){
		let toArray =  value.split('-');
		// tslint:disable-next-line:no-console
		console.log('value  of i:::',toArray[0]);
		return toArray[0];
	}

}
