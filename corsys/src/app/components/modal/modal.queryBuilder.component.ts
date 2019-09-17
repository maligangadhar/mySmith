import { Component, Inject, EventEmitter, Output, ViewChild, OnInit, Input } from '@angular/core';
import { ICaseService, ITranslateService, IMessageService, IDateFormatService, ICacheStorageService } from '../../interfaces/interfaces';
import { Subject } from 'rxjs/Rx';
import { metaDataSettings, responseStatus, controlCenterColumn, spinnerType, caseStatus } from '../../models/enums';
import { IKeyValue, ISearchGetResponseFormat, ILoaderMessage } from '../../models/viewModels';
import { SpDateRangeComponent } from '../../controls/dateRange.control';
import { IMyDateRangeModel } from '@corsys/daterangepicker';
import { SpAutocompleteComponent } from '../../controls/autocomplete.control';
import { SelectItem } from 'primeng/primeng';
@Component({
	selector: 'sp3-comp-modal-querybuilder',
	templateUrl: './modal.queryBuilder.component.html'
})

export class ModalQueryBuilderComponent implements OnInit {
	@ViewChild('autocompleteCaseId') autocompleteCaseId: SpAutocompleteComponent;
	@ViewChild('autocompleteStatus') autocompleteStatus: SpAutocompleteComponent;
	@ViewChild('autocompleteShippingCompany') autocompleteShippingCompany: SpAutocompleteComponent;
	@ViewChild('dateRangeLastModified') dateRangeLastModified: SpDateRangeComponent;
	@ViewChild('dateRangeArrivaDate') dateRangeArrivaDate: SpDateRangeComponent;
  	@Input() public sourceType?: any;
	@Output() addAdvancedSearchCriterias: EventEmitter<any[]> = new EventEmitter<any[]>();
	column1Expanded: boolean = false;
	column2Expanded: boolean = false;
	column3Expanded: boolean = false;
	column4Expanded: boolean = false;
	column5Expanded: boolean = false;
	column6Expanded: boolean = false;
	column7Expanded: boolean = false;
	column8Expanded: boolean = false;
	column9Expanded: boolean = false;
	column10Expanded: boolean = false;
	column11Expanded: boolean = false;
	caseStatusList: IKeyValue[] = [];
	ngUnsubscribe: Subject<any> = new Subject<any>();
	autocompleteFilterCriteriaShippingCompany: string[] = [controlCenterColumn[controlCenterColumn.ShippingCompany]];
	autocompleteFilterCriteriaCaseId: string[] = [controlCenterColumn[controlCenterColumn.CaseId]];
	countryList: SelectItem[] = [];
	selectedFromCountries: string[] = [];
	selectedToCountries: string[] = [];
	selectedRiskRatings: string[] = [];
	statusSuggestions: ISearchGetResponseFormat[];
	caseIdSuggestions: ISearchGetResponseFormat[] = [];
	shippingCompanySuggestions: ISearchGetResponseFormat[] = [];
	selectedStatuses: string[] = [];
	resultsStatus: SelectItem[];
	riskRating: SelectItem[];
	riskScoreValue: string='';
	searchResults: any[];
	updatedbeginDate: string = '';
	updatedEndDate: string = '';
	arrivalbeginDate: string = '';
	arrivalEndDate: string = '';
	queryTags: any[] = [];
	searchContainerValue: string = '';
	searchTextShippingCompany: string = '';
	searchTextCaseID: string = '';
	dateRangeSetLastModified: (event: IMyDateRangeModel) => void;
	dateRangeSetArrival: (event: IMyDateRangeModel) => void;
	closeClick: () => void;
	public visible = false;
	public visibleAnimate = false;
	@Input() staticStatusList: caseStatus[] = [];
	toggleSearchButton: boolean = false;
	globalCaseIdHolder: string;
	globalShippingCompanyHolder: string;
	loaderMessage: ILoaderMessage = { id: '', headerMessage: 'Loading Cases...', footerMessage: 'Loading Cases..', showLoader: true, type: spinnerType.small };
	constructor( @Inject('ICaseService') private caseService: ICaseService,
    @Inject('ITranslateService') private translateService: ITranslateService,
    @Inject('ICacheStorageService') public cacheStorageService: ICacheStorageService,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('IDateFormatService') private dateFormatService: IDateFormatService) {
		this.getCaseMetadata();
		var vm = this;
		this.dateRangeSetLastModified = (event: IMyDateRangeModel) => {
			if (event.beginJsDate !== null && event.endJsDate !== null) {
			this.updatedbeginDate = vm.dateFormatService.formatDateforApi(event.beginJsDate);
			if (event.endJsDate) {
				let setEndDate = new Date(event.endJsDate);
          		setEndDate.setHours(23);
          		setEndDate.setMinutes(59);
          		setEndDate.setSeconds(59);
				this.updatedEndDate = vm.dateFormatService.formatDateforApi(setEndDate);
				
			}
			} else {
				this.updatedbeginDate = '';
				this.updatedEndDate = '';
			}
		};
		this.dateRangeSetArrival = (event: IMyDateRangeModel) => {
			if (event.beginJsDate !== null && event.endJsDate !== null) {
			this.arrivalbeginDate = vm.dateFormatService.formatDateforApi(event.beginJsDate);
			if (event.endJsDate) {
				let setEndDate = new Date(event.endJsDate);
          		setEndDate.setHours(23);
          		setEndDate.setMinutes(59);
          		setEndDate.setSeconds(59);
				this.arrivalEndDate = vm.dateFormatService.formatDateforApi(setEndDate);				
			}
			} else {
				this.arrivalbeginDate = '';
				this.arrivalEndDate = '';
			}
		};
	}
	reset(): void {
		this.column1Expanded = false;
		this.column2Expanded = false;
		this.column3Expanded = false;
		this.column4Expanded = false;
		this.column5Expanded = false;
		this.column6Expanded = false;
		this.column7Expanded = false;
		this.column8Expanded = false;
		this.column9Expanded = false;
		this.column10Expanded = false;
		this.column11Expanded = false;
		//this.countryList = [];
		this.selectedFromCountries = [];
		this.selectedToCountries = [];
		this.selectedStatuses = [];
		this.statusSuggestions = [];
		this.caseIdSuggestions = [];
		this.shippingCompanySuggestions = [];
		//this.resultsStatus=[];
		this.searchResults = [];
		this.updatedbeginDate = '';
		this.searchTextCaseID = '';
		this.riskScoreValue='';
		this.searchTextShippingCompany = '';
		this.updatedEndDate = '';
		this.arrivalbeginDate = '';
		this.arrivalEndDate = '';
		this.queryTags = [];
		this.searchContainerValue = '';
		this.selectedRiskRatings = [];
	}
	setDefaultColumnSettings(): void {
		this.column1Expanded = false;
		this.column2Expanded = false;
		this.column3Expanded = false;
		this.column4Expanded = false;
		this.column5Expanded = false;
		this.column6Expanded = false;
		this.column7Expanded = false;
		this.column8Expanded = false;
		this.column9Expanded = false;
		this.column10Expanded = false;
		this.column11Expanded = false;
	}
	public show(): void {
		this.visible = true;
		this.reset();
		setTimeout(() => this.visibleAnimate = true);
	}

	public hide(): void {
		this.visibleAnimate = false;
		// this.reset();
		setTimeout(() => this.visible = false, 300);
	}
	columnExpandCollapse(tabNumber: number): void {
		switch (tabNumber) {
			case 1:
				this.column1Expanded = !this.column1Expanded;
				break;
			case 2:
				this.column2Expanded = !this.column2Expanded;
				break;
			case 3:
				this.column3Expanded = !this.column3Expanded;
				break;
			case 4:
				this.column4Expanded = !this.column4Expanded;
				break;
			case 5:
				this.column5Expanded = !this.column5Expanded;
				break;
			case 6:
				this.column6Expanded = !this.column6Expanded;
				break;
			case 7:
				this.column7Expanded = !this.column7Expanded;
				break;
			case 8:
				this.column8Expanded = !this.column8Expanded;
				break;
			case 9:
				this.column9Expanded = !this.column9Expanded;
				break;
			case 10:
				this.column10Expanded = !this.column10Expanded;
				break;
			case 11:
				this.column11Expanded = !this.column11Expanded;
				break;
		}
	}

	onSearchButtonClick() {
		this.queryTags = [];
		let caseIds: string[] = [];
		let shippingCompanies: string[] = [];
		this.loaderMessage.showLoader = true;
		this.messageService.LoaderMessage = this.loaderMessage;
		if (!Array.isArray(this.autocompleteCaseId.selectedSearch) && this.globalCaseIdHolder) {
			caseIds.push(this.globalCaseIdHolder);
			this.globalCaseIdHolder = '';
		}
		for (let caseid in this.autocompleteCaseId.selectedSearch) {
			caseIds.push((this.autocompleteCaseId.selectedSearch[caseid].fieldValue));
		}
		if (!Array.isArray(this.autocompleteCaseId.selectedSearch) && this.globalShippingCompanyHolder) {
			shippingCompanies.push(this.globalShippingCompanyHolder);
			this.globalShippingCompanyHolder = '';
		}
		for (let shippingCompany in this.autocompleteShippingCompany.selectedSearch) {
			shippingCompanies.push((this.autocompleteShippingCompany.selectedSearch[shippingCompany].fieldValue));
		}
		if (this.searchTextShippingCompany.trim() !== '') {
			shippingCompanies.push((this.searchTextShippingCompany.trim()));
		}

		if (caseIds.length > 0) {
			this.queryTags.push({
				'fieldName': controlCenterColumn[controlCenterColumn.CaseId],
				'fieldValue': caseIds.join(',')
			});
		}
		if (this.selectedToCountries.length > 0) {
			this.queryTags.push({
				'fieldName': controlCenterColumn[controlCenterColumn.To],
				'fieldValue': this.selectedToCountries.join(',')
			});
		}
		if (this.selectedFromCountries.length > 0) {
			this.queryTags.push({
				'fieldName': controlCenterColumn[controlCenterColumn.From],
				'fieldValue': this.selectedFromCountries.join(',')
			});
		}

		if (this.selectedStatuses.length > 0) {
			this.queryTags.push({
				'fieldName': controlCenterColumn[controlCenterColumn.Status],
				'fieldValue': this.selectedStatuses.join(',')
			});
		}

		if (this.searchContainerValue !== '') {
			this.queryTags.push({
				'fieldName': controlCenterColumn[controlCenterColumn.ContainerId],
				'fieldValue': this.searchContainerValue.trim()
			});
		}

		if (shippingCompanies.length > 0) {
			this.queryTags.push({
				'fieldName': controlCenterColumn[controlCenterColumn.ShippingCompany],
				'fieldValue': shippingCompanies.join(',')
			});
		}

		if (this.updatedbeginDate !== '' && this.updatedEndDate !== '') {
			this.queryTags.push({
				'fieldName': controlCenterColumn[controlCenterColumn.LastModified],
				'fieldValue': (this.updatedbeginDate + ',' + this.updatedEndDate).toString()
			});
		}
		if (this.arrivalbeginDate !== '' && this.arrivalEndDate !== '') {
			this.queryTags.push({
				'fieldName': controlCenterColumn[controlCenterColumn.DateOfArrival],
				'fieldValue': (this.arrivalbeginDate + ',' + this.arrivalEndDate).toString()
			});
		}
		if (this.selectedRiskRatings.length > 0) {
			this.queryTags.push({
				'fieldName': controlCenterColumn[controlCenterColumn.RiskRating],
				'fieldValue': this.selectedRiskRatings.join(',')
			});
		}
		if (this.riskScoreValue !== '') {
			this.queryTags.push({
				'fieldName': controlCenterColumn[controlCenterColumn.OverAllRisk],
				'fieldValue': this.riskScoreValue.trim()
			});
		}

		//return sorted array for reducing the time complexity
		this.queryTags.sort( (param1, param2): number => {
			let firstObj = param1.fieldName.toLowerCase();
			let secondObj = param2.fieldName.toLowerCase();
			if (firstObj < secondObj) {
				return -1;
			}
			if (firstObj > secondObj) {
				return 1;
			}

			return 0;
		});
		//overAllRisk
		this.addAdvancedSearchCriterias.emit(this.queryTags);
		this.hide();
		this.setDefaultColumnSettings();
	}

	getCaseIdOnBlur(event: any): void {
		//console.log(event);
		if(event===''){
			this.globalCaseIdHolder = '';
		}
	}

	getShippingcompOnBlur(event: any): void {
		if(event===''){
			this.searchTextShippingCompany = '';
		}
	}

	getSearchCaseIdData(event: any): void {				
		this.globalCaseIdHolder = event['query'];
		this.toggleSearchButton = true;
			if(event != null)
			{	
				this.searchTextCaseID = event.query.trim();
				this.caseService.getSearchdata(this.searchTextCaseID, this.autocompleteFilterCriteriaCaseId)
					.takeUntil(this.ngUnsubscribe)
					.subscribe(result => {
						this.autocompleteCaseId.suggestions = this.caseIdSuggestions = result.data;
						this.toggleSearchButton = false;
					}, (error) => {
						this.toggleSearchButton = false;						
						throw new Error('Unable to lookup for CaseId');
					});
			}
			else
			{			
				this.autocompleteCaseId.suggestions = [];
				this.toggleSearchButton = false;
			}			
	}
	getSearchShippingCompanyData(event: any): void {
		this.toggleSearchButton = true;
		this.searchTextShippingCompany = event.query.trim();
		this.caseService.getSearchdata(this.searchTextShippingCompany, this.autocompleteFilterCriteriaShippingCompany)
			.takeUntil(this.ngUnsubscribe)
			.subscribe(result => {
				this.toggleSearchButton = false;
				this.autocompleteShippingCompany.suggestions = this.shippingCompanySuggestions = result.data;
			}, (error) => {
				this.toggleSearchButton = false;
				throw new Error('Unable to lookup fpr Shipping Company '+ error);
			});
	}
	searchCriteriaAddedCase(event: any): void {
		this.searchTextCaseID = '';
	}
	searchCriteriaAddedShippingCompany(event: any): void {
		this.searchTextShippingCompany = '';
	}
	getCaseMetadata() {
		this.toggleSearchButton = true;
      this.cacheStorageService.cacheMetaData=null;
      this.caseService.fetchMetadata().subscribe(result => {
        this.resultsStatus = [];
        this.riskRating = [];
        if (result.status === responseStatus.Success) {
          this.resultsStatus = result.data.CargoStatus.reduce( (result: SelectItem[], param: IKeyValue) => {
            let currentItem = {label: param.name.trim(), value: param.id.toString().trim()};
            return this.staticStatusList.length ?  (this.staticStatusList.indexOf(+currentItem.value) > -1 ? result.concat(currentItem) : result): result.concat(currentItem);
          }, []).sort( (a: SelectItem, b: SelectItem) => {
            let part1 = a.label.toUpperCase();
            let part2 = b.label.toUpperCase();
            if (part1 < part2) {
              return -1;
            }
            if (part1 > part2) {
              return 1;
            }
            return 0;
          });
          for (let status in result.data.RiskColor) {
            let tempStatus: SelectItem = {
              label: this.translateService.instant(result.data.RiskColor[status].name.trim()),
              value: result.data.RiskColor[status].id.toString().trim()
            };
            this.riskRating.push(tempStatus);
          }
        }
      });
		this.caseService.fetchCaseCreateMetaData(metaDataSettings.Cases).subscribe(result => {
			if (result.status === responseStatus.Success) {
				this.toggleSearchButton = false;
				for (let country in result.data.Country) {
					let countryToAdd: SelectItem = {
						label: result.data.Country[country].name.trim(),
						value: result.data.Country[country].code.trim()
					};
					this.countryList.push(countryToAdd);
				}
			} else {
				this.toggleSearchButton = false;
			}

		}, (error) => {
			this.toggleSearchButton = false;
			throw new Error('Error fetching Case Meta Data' + error);
		});
	}
	ngOnInit(): void {
		this.setDefaultColumnSettings();
	}
}
