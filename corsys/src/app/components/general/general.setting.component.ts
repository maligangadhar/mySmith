import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { IResponse, IKeyData, IKeyValue, IGeneralSettingsData, IGeneralFormat } from '../../models/viewModels';
import { IGeneralSettings, IMessageService, IBroadcastService, IStorageService, ITranslateService, ICacheStorageService } from '../../interfaces/interfaces';
import { responseStatus, metaDataSettings, messageType, action, page, spinnerType } from '../../models/enums';
import { Subject } from 'rxjs/Rx';
import { appLanguage } from '../../businessConstants/businessConstants';
@Component({
	selector: 'sp3-comp-general-settings',
	templateUrl: './general.setting.component.html'
})

export class GeneralSettingComponent implements OnInit, OnDestroy {
	message: string;
	getMetaData: () => void;
	getGeneralSettings: () => void;
	enableDisableButtons: () => void;
	updateGeneralSettings: () => void;
	cancelUpdateSettings: () => void;
	id: string = 'generalEdit';
	onSelectChanged: (selectedValue: IKeyValue, key: string) => void;
	currencyList: IKeyValue[] = [];	
	languageList: IKeyValue[] = [];
	dateFormatList: IKeyValue[] = [];
	timeFormatList: IKeyValue[] = [];
	weightList: IKeyValue[] = [];
	lengthList: IKeyValue[] = [];
	selectedCurrency: IKeyValue;	
	selectedLanguage: IKeyValue;
	selectedDateFormat: IKeyValue;
	selectedTimeFormat: IKeyValue;
	selectedWeight: IKeyValue;
	selectedLength: IKeyValue;
	IsSaveDisabled: boolean = true;
	IsCancelDisabled: boolean = true;
	IsSuccess: boolean = false;
	generalSettingsDetails: IGeneralSettingsData = {
		currency: 0,
		timeFormat: 0,
		timezone: 0,
		dateFormat: 0,
		language: 0,
		units: { length: 0, weight: 0 }
	};
	updatedGeneralSettingsDetails: IGeneralSettingsData = {
		currency: 0,
		timeFormat: 0,
		timezone: 0,
		dateFormat: 0,
		language: 0,
		units: { length: 0, weight: 0 }
	};
	ngUnsubscribe: Subject<any> = new Subject<any>();
	constructor(
		@Inject('IGeneralSettings') private generalSettings: IGeneralSettings,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('IStorageService') private storageService: IStorageService,
		@Inject('ICacheStorageService') public cacheStorageService: ICacheStorageService,
		@Inject('ITranslateService') private translateService: ITranslateService) {
		var vm = this;

		vm.getMetaData = () => {
			vm.IsSuccess = false;
			this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SettingsLoading'), showLoader: true, type: spinnerType.small }; 
			vm.generalSettings.fetchGeneralSettingsMetaData(metaDataSettings.GeneralSettings).subscribe(result => {
				if (result.status === responseStatus.Success) {
					if (!result.data) {
						vm.messageService.Message = { message: 'RolesNotExist', showMessage: true, type: messageType.Error };
					}
					else {
						vm.currencyList = result.data.Currency;
						vm.dateFormatList = result.data.DateFormat;
						vm.languageList = result.data.Language;
						vm.timeFormatList = result.data.TimeFormat;					
						vm.lengthList = result.data.Length;
						vm.weightList = result.data.Weight;
						vm.getGeneralSettings();
					}
				}
				this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SettingsLoading'), showLoader: false, type: spinnerType.small }; 
			},
				(error: IResponse<any>) => {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SettingsLoading'), showLoader: false, type: spinnerType.small }; 
					vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				});
			
		};
		vm.getGeneralSettings = () => {
			vm.IsSuccess = false;
			this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SettingsLoading'), showLoader: true, type: spinnerType.small }; 
			vm.generalSettings.getGenralSettings().subscribe(result => {
				if (result.status === responseStatus.Success) {
					if (!result.data) {
						vm.messageService.Message = { message: 'RolesNotExist', showMessage: true, type: messageType.Error };
					}
					else {
						vm.generalSettingsDetails.currency = result.data.currency;
						vm.generalSettingsDetails.dateFormat = result.data.dateFormat;
						vm.generalSettingsDetails.language = result.data.language;
						vm.generalSettingsDetails.timeFormat = result.data.timeFormat;					
						vm.generalSettingsDetails.units.length = result.data.units.length;
						vm.generalSettingsDetails.units.weight = result.data.units.weight;

						vm.updatedGeneralSettingsDetails.currency = result.data.currency;
						vm.updatedGeneralSettingsDetails.dateFormat = result.data.dateFormat;
						vm.updatedGeneralSettingsDetails.language = result.data.language;
						vm.updatedGeneralSettingsDetails.timeFormat = result.data.timeFormat;					
						vm.updatedGeneralSettingsDetails.units.length = result.data.units.length;
						vm.updatedGeneralSettingsDetails.units.weight = result.data.units.weight;
						if (result.data.currency != null && vm.currencyList.length !== 0) {
							vm.selectedCurrency = vm.currencyList[Object.keys(vm.currencyList).find(k => vm.currencyList[k].id === result.data.currency)];
						}
						if (result.data.timeFormat != null && vm.timeFormatList.length !== 0) {
							vm.selectedTimeFormat = vm.timeFormatList[Object.keys(vm.timeFormatList).find(k => vm.timeFormatList[k].id === result.data.timeFormat)];
						}
						/*if (result.data.timezone != null && vm.timeZoneList.length !== 0) {
							vm.selectedTimeZone = vm.timeZoneList[Object.keys(vm.timeZoneList).find(k => vm.timeZoneList[k].id === result.data.timezone)];
						}*/
						if (result.data.dateFormat != null && vm.dateFormatList.length !== 0) {
							vm.selectedDateFormat = vm.dateFormatList[Object.keys(vm.dateFormatList).find(k => vm.dateFormatList[k].id === result.data.dateFormat)];
						}
						if (result.data.language != null && vm.languageList.length !== 0) {
							vm.selectedLanguage = vm.languageList[Object.keys(vm.languageList).find(k => vm.languageList[k].id === result.data.language)];
						}
						if (result.data.units.length != null && vm.lengthList.length !== 0) {
							vm.selectedLength = vm.lengthList[Object.keys(vm.lengthList).find(k => vm.lengthList[k].id === result.data.units.length)];
						}
						if (result.data.units.weight != null && vm.weightList.length !== 0) {
							vm.selectedWeight = vm.weightList[Object.keys(vm.weightList).find(k => vm.weightList[k].id === result.data.units.weight)];
						}
					}
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SettingsLoading'), showLoader: false, type: spinnerType.small }; 
				}
			},
				(error: IResponse<any>) => {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SettingsLoading'), showLoader: false, type: spinnerType.small }; 
					vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				});
		};


		vm.onSelectChanged = (selectedValue: IKeyValue, key: string) => {
			vm.IsSuccess = false;

			// vm.updatedGeneralSettingsDetails = vm.generalSettingsDetails;
			if (key === 'Currency') {
				vm.selectedCurrency = selectedValue;
				if (selectedValue.id !== vm.generalSettingsDetails.currency) {
					vm.messageService.setPageChange(action.generalSettingsChange, true);
				}
				vm.updatedGeneralSettingsDetails.currency = selectedValue.id;

			}			
			else if (key === 'TimeFormat') {
				vm.selectedTimeFormat = selectedValue;
				if (selectedValue.id !== vm.generalSettingsDetails.timeFormat) {
					vm.messageService.setPageChange(action.generalSettingsChange, true);
				}
				vm.updatedGeneralSettingsDetails.timeFormat = selectedValue.id;
			}
			else if (key === 'DateFormat') {
				vm.selectedDateFormat = selectedValue;
				if (selectedValue.id !== vm.generalSettingsDetails.dateFormat) {
					vm.messageService.setPageChange(action.generalSettingsChange, true);
				}
				vm.updatedGeneralSettingsDetails.dateFormat = selectedValue.id;
			}
			else if (key === 'Length') {
				vm.selectedLength = selectedValue;
				if (selectedValue.id !== vm.generalSettingsDetails.units.length) {
					vm.messageService.setPageChange(action.generalSettingsChange, true);
				}
				vm.updatedGeneralSettingsDetails.units.length = selectedValue.id;
			}
			else if (key === 'Weight') {
				vm.selectedWeight = selectedValue;
				if (selectedValue.id !== vm.generalSettingsDetails.units.weight) {
					vm.messageService.setPageChange(action.generalSettingsChange, true);
				}
				vm.updatedGeneralSettingsDetails.units.weight = selectedValue.id;
			}
			else if (key === 'Language') {
				vm.selectedLanguage = selectedValue;
				if (selectedValue.id !== vm.generalSettingsDetails.language) {
					vm.messageService.setPageChange(action.generalSettingsChange, true);
				}
				vm.updatedGeneralSettingsDetails.language = selectedValue.id;
			}

			vm.enableDisableButtons();

		};
		vm.enableDisableButtons = () => {
			vm.IsSuccess = false;
			if (vm.generalSettingsDetails.currency !== vm.updatedGeneralSettingsDetails.currency ||
				vm.generalSettingsDetails.language !== vm.updatedGeneralSettingsDetails.language ||
				vm.generalSettingsDetails.units.length !== vm.updatedGeneralSettingsDetails.units.length ||
				vm.generalSettingsDetails.units.weight !== vm.updatedGeneralSettingsDetails.units.weight ||
				vm.generalSettingsDetails.timeFormat !== vm.updatedGeneralSettingsDetails.timeFormat ||
				vm.generalSettingsDetails.dateFormat !== vm.updatedGeneralSettingsDetails.dateFormat) {
				vm.IsCancelDisabled = false;
				vm.IsSaveDisabled = false;

			}	
			else {

				vm.IsCancelDisabled = true;
				vm.IsSaveDisabled = true;
				vm.broadcastService.broadcast(vm.id, null);
			}

		};

		vm.updateGeneralSettings = () => {
			this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SaveSettingsLoading'), showLoader: true, type: spinnerType.small };
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			vm.generalSettings.updateGeneralSettings(vm.updatedGeneralSettingsDetails).subscribe(result => {
				if (result.status === responseStatus.Success) {
					cacheStorageService.cacheGeneralSettingMetaData = null;
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SaveSettingsLoading'), showLoader: false, type: spinnerType.small };
					let dateFormat = vm.dateFormatList.filter(param => param.id === vm.updatedGeneralSettingsDetails.dateFormat)[0];
					let timeFormat = vm.timeFormatList.filter(param => param.id === vm.updatedGeneralSettingsDetails.timeFormat)[0];
					let language=vm.languageList.filter(param => param.id === vm.updatedGeneralSettingsDetails.language)[0];
					let generalFormat: IGeneralFormat = {
						dateFormat: dateFormat.name,
						timeFormat: timeFormat.name,
						language: language.id
					};
					vm.storageService.setItem('generalFormat', generalFormat);
					if(vm.updatedGeneralSettingsDetails.language && vm.updatedGeneralSettingsDetails.language!==null)
					{
						vm.generalSettingsDetails.language=vm.updatedGeneralSettingsDetails.language;
						 vm.translateService.use( appLanguage[this.storageService.getItem('generalFormat').language]);
						 if(vm.updatedGeneralSettingsDetails.language!==vm.generalSettingsDetails.language)
						 {
						 vm.getMetaData();
						 }
				    }
			
					
					vm.messageService.resetPageChange();
					vm.IsSuccess = true;
					vm.IsSaveDisabled = true;
					vm.IsCancelDisabled = true;
					vm.broadcastService.broadcast(vm.id, null);
				}
				else {
					this.messageService.LoaderMessage = { id: '', headerMessage:vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SaveSettingsLoading'), showLoader: false, type: spinnerType.small };
					vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
				}
				this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SettingsLoading'), showLoader: false, type: spinnerType.small }; 
			},
				(error: IResponse<any>) => {
					this.messageService.LoaderMessage = { id: '', headerMessage: vm.translateService.instant('GeneralSettingsHeader'), footerMessage: vm.translateService.instant('SaveSettingsLoading'), showLoader: false, type: spinnerType.small };
					vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				}
			);
		};
		vm.cancelUpdateSettings = () => {
			if (vm.messageService.showLeaveMessage(action.generalSettingsChange)) {
				this.messageService.LeaveMessage = { key: 'GeneralSettings', showMessage: true, type: action.generalSettingsChange };
			}
		};
		vm.messageService.OperationGoAhead.subscribe(item => {
			if (item && item.operationAllowed && (item.from === action.generalSettingsChange || item.from === action.roleTabChange)) {
				this.messageService.resetPageChange();
				vm.getGeneralSettings();
				vm.IsSaveDisabled = true;
				vm.IsCancelDisabled = true;
				vm.broadcastService.broadcast(vm.id, null);
			}
			else {
				vm.IsCancelDisabled = false;
				vm.IsSaveDisabled = false;
			}

		});
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			if (result.key === page.role.toString() || result.key === page.user.toString() || result.key === page.applications.toString()) {
				vm.IsSuccess = false;
			}
		});

	}
	ngOnInit() {
		this.getMetaData();

	}
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
