import { Component, ViewChild, OnInit, Inject, Output, OnDestroy, Input } from '@angular/core';
import { ICommonService, ITranslateService, IMessageService, ICaseService, IBroadcastService, IAttachmentService, IDateFormatService } from '../../interfaces/interfaces';
import { IResponse, IKeyValue, IKeyData, ICaseCreateDetails, IContainer, IAttachment, ICustomMessageResponse, ILoaderMessage } from '../../models/viewModels';
import {
	responseStatus, messageType, metaDataSettings, caseButtonTypes, caseStatus,
	messageResponseType, broadcastKeys, casePageStatus
} from '../../models/enums';
import { SpSelectComponent } from '../../controls/select.control';
import { SpTextboxComponent } from '../../controls/textbox.control';
import { SpMultiTextboxComponent } from '../../controls/multi.text.control';
import { ModalConfirmComponent } from '../modal/modal.confirm.component';
import { ModalCaseAlertComponent } from '../modal/modal.case.alert.component';
import { ModalCaseMatchComponent } from '../modal/modal.case.match.component';
import { Subject } from 'rxjs/Rx';
import { spinnerType } from '../../models/enums';
import { SP3DatePickerComponent } from '../../controls/datepicker.control';
@Component({
	selector: 'sp3-comp-modal-case-creation',
	templateUrl: './modal.case.creation.component.html'
})

export class ModalCaseCreationComponent implements OnInit, OnDestroy {
	@Output() cardDisplayUpdate;
	@ViewChild('plateNumber') plateNumber: SpTextboxComponent;
	@ViewChild('vehicleMake') vehicleMake: SpTextboxComponent;
	@ViewChild('driverLicense') driverLicense: SpTextboxComponent;
	@ViewChild('shipId') shipId: SpTextboxComponent;
	@ViewChild('containerId') containerId: SpTextboxComponent;
	@ViewChild('sender') sender: SpTextboxComponent;
	@ViewChild('senderAddress') senderAddress: SpTextboxComponent;
	@ViewChild('hsCode') hsCode: SpMultiTextboxComponent;
	@ViewChild('overallWeight') overallWeight: SpTextboxComponent;
	@ViewChild('shipCompany') shipCompany: SpTextboxComponent;
	@ViewChild('shipContact') shipContact: SpTextboxComponent;
	@ViewChild('driverName') driverName: SpTextboxComponent;
	@ViewChild('vehicleCompany') vehicleCompany: SpTextboxComponent;
	@ViewChild('vehicleModal') vehicleModal: SpTextboxComponent;
	@ViewChild('modalClose') modalClose: ModalConfirmComponent;
	@ViewChild('modalDeleteCase') modalDeleteCase: ModalCaseAlertComponent;
	@ViewChild('modalDeleteAttachment') modalDeleteAttachment: ModalCaseAlertComponent;
	@ViewChild('modalValidationDraft') modalValidationDraft: ModalConfirmComponent;
	@ViewChild('modalMatchCase') modalMatchCase: ModalCaseMatchComponent;
	@ViewChild('notes') notes: SpMultiTextboxComponent;
	@ViewChild('nationality') nationality: SpSelectComponent;
	@ViewChild('caseFrom') caseFrom: SpSelectComponent;
	@ViewChild('caseTo') caseTo: SpSelectComponent;
	@ViewChild('arrivaldate') arrivaldate: SP3DatePickerComponent;
	isShipPanelValid: number = 0;
	isCasePanelValid: number = 0;
	isContainerPanelValid: number = 0;
	isVehiclePanelValid: number = 0;
	isAttachmentPanelValid: number = 0;
	caseDate: Object | string;
	caseDateArrival: Date;
	nationalityClass = '';
	isDisabled: boolean = false;
	isShipDisabled: boolean = true;
	generatedCaseId: string[] = ['-'];
	caseStatus: string = '-';
	IsCreationSuccess: boolean = false;
	saveInProgress: boolean = false;
	IsDraftCreationSuccess: boolean = false;
	ngUnsubscribe: Subject<any> = new Subject<any>();
	pageStatus: casePageStatus = casePageStatus.IsCreateCaseOpened;
	checkType: any = casePageStatus;
	isExistingCaseSaveChanges: boolean = false;
	destinationCountryName: string = '';
	sourceCountryName: string = '';
	statusName: string = '';
	duplicateCaseResponse: any;
	existingCaseStatus: caseStatus;
	selectedCaseIds: string[] = [];
	selectedAttachmentIds: string[] = [];

	loaderMessage: ILoaderMessage = { id: '', headerMessage: 'Arrivals', footerMessage: 'Loading...', showLoader: true, type: spinnerType.small };
	caseCreateDetails: ICaseCreateDetails = {
		caseId: null,
		cargoType: 0,
		senderName: '',
		senderAddress: '',
		from: '',
		to: '',
		originPortCode: '',
		destinationPortCode: '',
		dateOfArrival: '',
		overallWeight: 0,
		notes: '',
		shipping: {
			shipId: '',
			shippingCompany: '',
			contactDetails: '',
			nationality: ''
		},
		vehicle: {
			licensePlateNumber: '',
			make: '',
			driverName: '',
			company: '',
			model: '',
			driverLicenseNumber: ''
		},
		containers: [{
			containerId: '',
			harmonisedSystemCodes: []
		}],
		lastUpdateDate: '',
		lastUpdatedBy: '',
		status: 0,
		locationcode: ''
	};

	newCaseDetails: ICaseCreateDetails = {
		caseId: null,
		cargoType: 0,
		senderName: '',
		senderAddress: '',
		from: '',
		to: '',
		originPortCode: '',
		destinationPortCode: '',
		dateOfArrival: '',
		overallWeight: 0,
		notes: '',
		shipping: {
			shipId: '',
			shippingCompany: '',
			contactDetails: '',
			nationality: ''
		},
		vehicle: {
			licensePlateNumber: '',
			make: '',
			driverName: '',
			company: '',
			model: '',
			driverLicenseNumber: ''
		},
		containers: [{
			containerId: '',
			harmonisedSystemCodes: []
		}],
		lastUpdateDate: '',
		lastUpdatedBy: '',
		status: 0,
		locationcode: ''
	};
	containersList: IContainer[] = [];
	@Input() controlId?: string;
	@Input() public visible: boolean = false;
	@Input() public visibleAnimate: boolean = false;
	isDirty: boolean;
	id: string = 'caseCreate';
	countryData: any;
	caseFromCountryCodeList: IKeyValue[] = [];
	caseToCountryCodeList: IKeyValue[] = [];
	caseFromCountryNameList: IKeyValue[] = [];
	caseToCountryNameList: IKeyValue[] = [];
	sourcePortList: IKeyValue[] = [];
	destinationPortList: IKeyValue[] = [];
	cargoTypesList: IKeyValue[] = [];
	nationalityNameList: IKeyValue[] = [];
	nationalityCodeList: IKeyValue[] = [];

	expandAllClasss: string = 'btn btn-link';
	collapseAllClass: string = 'btn btn-link';
	isExpandAllDisabled: boolean = false;
	isCollapseAllDisabled: boolean = false;
	column1Expanded: boolean = true;
	column2Expanded: boolean = false;
	column3Expanded: boolean = false;
	column4Expanded: boolean = false;
	column5Expanded: boolean = false;
	isShipCompanyRequired: boolean = false;
	isNationalityRequired: boolean = false;
	isShipContainerIdRequired: boolean = false;

	//Ngmodels for controls
	selectedCargoType: IKeyValue;
	senderValue: string = '';
	senderAddressValue: string = '';
	hsCodeValue: string = '';
	selectedFromCountry: IKeyValue;
	selectedToCountry: IKeyValue;
	selectedOriginalPort: IKeyValue;
	selectedDestinationPort: IKeyValue;
	overAllWeightValue: string = '';
	caseNotes: string = '';
	shipIdValue: string = '';
	shipCompanyValue: string = '';
	shipContactValue: string = '';
	selectedNationality: IKeyValue;
	plateNumberValue: string = '';
	vehicleMakeValue: string = '';
	driveNameValue: string = '';
	vehicleCompanyValue: string = '';
	vehicleModelValue: string = '';
	driverLicenseValue: string = '';
	containerIdValue: string = '';
	caseStatusList: IKeyValue[] = [];
	warningMessageShipPanel: string = '';
	warningMessageContainerPanel: string = '';
	warningMessageCasepanel = '';
	caseButtonTypes: any;
	reasonType: IKeyValue[] = [];
	pageTitle: string;
	oldAttachments: IAttachment[];
	attachments: IAttachment[] = [];
	selectedAttachments: IAttachment[] = [];
	deletedAttachments: IAttachment[] = [];
	isSaveAttachmentDisabled: boolean = false;

	getCaseMetadata: () => void;
	reset: () => void;
	closeClick: () => void;
	leaveClick: () => void;
	backClick: () => void;
	yesClick: () => void;
	noClick: () => void;
	show: () => void;
	hide: () => void;
	toggleClick: (response: any) => void;
	GetCreateButtonEnabled: () => boolean;
	GetSelectedAppsCount: () => number;
	onTextAdded: (key: SpTextboxComponent) => void;
	onNotesTextAdded: (key: SpMultiTextboxComponent) => void;
	onShipIdTextAdded: (key: SpTextboxComponent) => void;
	handleShipId: (key: SpTextboxComponent) => void;
	onSelectChanged: (key: string, selectValue: IKeyValue) => void;
	createCase: (status: caseStatus) => void;
	updateCase: (status: caseStatus) => void;
	setCaseDetailValues: (status: caseStatus) => void;
	handleDateUpdate: (event: any) => void;
	IsColumn1Collapsed: (isCollapsed: boolean) => void;
	IsColumn2Collapsed: (isCollapsed: boolean) => void;
	IsColumn3Collapsed: (isCollapsed: boolean) => void;
	IsColumn4Collapsed: (isCollapsed: boolean) => void;
	IsColumn5Collapsed: (isCollapsed: boolean) => void;
	expandAll: () => void;
	collapseAll: () => void;
	createCaseClick: () => void;
	checkValidations: () => void;
	saveAsDraftClick: () => void;
	updateDraftClick: () => void;
	updateCaseClick: () => void;
	saveChangesClick: () => void;
	validationDraftOkClick: () => void;
	deleteCaseClick: () => void;
	deleteCase: (responseType: messageResponseType) => void;
	deleteAttachmentResult: (responseType: messageResponseType) => void;
	isCaseValid: () => boolean;
	getGreenTickForColumn5: () => void;
	getGreenTickForColumn4: () => void;
	getGreenTickForColumn3: () => void;
	getGreenTickForColumn2: () => void;
	getGreenTickForColumn1: () => void;
	setDefaultColumnSettings: () => void;
	closeModal: () => void;
	setNewCaseDetails: (status: caseStatus) => void;
	selectAttachment: (attachment: IAttachment) => void;
	cancelAttachment: (attachment: IAttachment, rowIndex: number) => void;
	crossClick: (attachment: IAttachment, coulmnName: string) => void;
	onUploadAttachment: (event: ICustomMessageResponse<IAttachment>) => void;
	caseCreationCallBack: (caseCreationResponse: IResponse<ICaseCreateDetails>, addAtachmentResponse?: IResponse<IAttachment>[]) => void;
	caseUpdationCallBack: (caseCreationResponse: IResponse<ICaseCreateDetails>, addAtachmentResponse?: IResponse<IAttachment>[]) => void;
	resetMessages: () => void;
	refreshAttachmentGrid: (attachment: IAttachment[]) => void;
	onTableHeaderCheckboxToggle: (event: any) => void;
	downloadAttachment: (event: IAttachment) => void;
	deleteAttachmentClick: () => void;
	findSelectedAttachmentIndex: (selAttachment: IAttachment) => number;
	GetDeleteButtonDisabled: () => boolean;
	showSpinner: () => void;
	setExpandCollapseClass: () => void;
	setExpandCollapseButtonStatus: () => void;
	checkDuplicateCase: (sameCaseFlag: boolean) => void;
	onCargoTypeChange: (selType: IKeyValue) => void;

	constructor( @Inject('IMessageService') private messageService: IMessageService,
		@Inject('ICommonService') private commonService: ICommonService, @Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('ITranslateService') public translateService: ITranslateService,
		@Inject('ICaseService') private caseService: ICaseService,
		@Inject('IAttachmentService') private attachmentService: IAttachmentService,
		@Inject('IDateFormatService') private dateFormatService: IDateFormatService
	) {
		var vm = this;
		vm.caseButtonTypes = caseButtonTypes;
		vm.checkDuplicateCase = (sameCaseFlag: boolean) => {
			this.loaderMessage.showLoader = true;
			if (sameCaseFlag) {
				vm.reset();
			} else {
				this.isCasePanelValid = 0;
				this.isShipPanelValid = 0;
				this.isContainerPanelValid = 0;
				this.isVehiclePanelValid = 0;
				this.isAttachmentPanelValid = 0;
			}
		};

		vm.setExpandCollapseClass = () => {
			switch (this.isExpandAllDisabled) {
				case true:
					this.expandAllClasss = 'btn btn-link ';
					break;
				default:
					this.expandAllClasss = 'btn btn-link active';
					break;
			}

			switch (this.isCollapseAllDisabled) {
				case true:
					this.collapseAllClass = 'btn btn-link ';
					break;
				default:
					this.collapseAllClass = 'btn btn-link active';
					break;
			}
		};

		vm.setDefaultColumnSettings = () => {
			
			this.column1Expanded = vm.controlId === 'Draft' ? false: true;
			this.column2Expanded = false;
			this.column3Expanded = false;
			this.column4Expanded = false;
			this.column5Expanded = false;
			this.setExpandCollapseClass();
		};

		vm.showSpinner = () => {
			this.loaderMessage.showLoader = true;
			this.messageService.LoaderMessage = this.loaderMessage;
		};

		vm.GetDeleteButtonDisabled = () => {
			if (vm.isDisabled || (!vm.isDisabled && vm.selectedAttachments && vm.selectedAttachments.length === 0)) {
				return true;
			}
			return false;
		};

		vm.onTableHeaderCheckboxToggle = (event: any) => {
			if (event.checked === true) {
				for (let m of vm.attachments) {
					if (vm.selectedAttachments.find(obj => obj.title === m.title) === undefined) {
						this.selectedAttachments.push(m);
					}
				}

			}
			else {
				this.selectedAttachments.length = 0;
			}
		};

		vm.selectAttachment = (attachment: IAttachment) => {
			if (attachment.isEditable) {
				let newAttachments = vm.attachments.slice();
				vm.oldAttachments = JSON.parse(JSON.stringify(vm.attachments));
				for (var i = 0; i < newAttachments.length; i++) {
					vm.oldAttachments[i].rawFile = newAttachments[i].rawFile;
				}
			}
			attachment.isEditable = !attachment.isEditable;
			vm.isDirty = true;
		};

		vm.cancelAttachment = (attachment: IAttachment, rowIndex: number) => {
			attachment.title = vm.oldAttachments[rowIndex].title;
			attachment.description = vm.oldAttachments[rowIndex].description;
			attachment.isEditable = false;
			vm.isDirty = true;
		};

		vm.crossClick = (attachment: IAttachment, coulmnName: string) => {
			attachment[coulmnName] = '';
		};

		vm.onUploadAttachment = (event: ICustomMessageResponse<IAttachment>) => {
			vm.isDirty = true;
			let attachmentList = vm.oldAttachments;
			attachmentList.push(event.result);
			vm.refreshAttachmentGrid(attachmentList);
		};

		vm.deleteAttachmentClick = () => {
			vm.selectedAttachmentIds = [];
			if (vm.selectedAttachments && vm.selectedAttachments.length > 0) {
				for (var i = 0; i < vm.selectedAttachments.length; i++) {
					vm.selectedAttachmentIds.push(vm.selectedAttachments[i].title);
				}
				vm.modalDeleteAttachment.show();
			}
		};

		vm.deleteAttachmentResult = (responseType: messageResponseType) => {
			if (responseType === messageResponseType.Yes) {
				vm.modalDeleteAttachment.hide();
				vm.selectedAttachments.forEach((selAttachment) => {
					if (selAttachment.id) {
						selAttachment.isFileDeleted = true;
						vm.deletedAttachments.push(selAttachment);
					}
					let index = vm.findSelectedAttachmentIndex(selAttachment);
					vm.attachments = vm.attachments.filter((val, i) => i !== index);

				});
				vm.refreshAttachmentGrid(vm.attachments);
				vm.selectedAttachments.length = 0;
				vm.isDirty = true;
			}
		};

		vm.findSelectedAttachmentIndex = (selAttachment: IAttachment) => {
			return vm.attachments.indexOf(selAttachment);
		};

		vm.refreshAttachmentGrid = (attachmentList: IAttachment[]) => {
			vm.attachments = [];
			setTimeout(() => {
				vm.attachments = attachmentList;

				let newAttachments = vm.attachments.slice();
				vm.oldAttachments = JSON.parse(JSON.stringify(vm.attachments));
				for (var i = 0; i < newAttachments.length; i++) {
					vm.oldAttachments[i].rawFile = newAttachments[i].rawFile;
				}

			}, 1);
		};

		vm.expandAll = () => {
			vm.column1Expanded = vm.column2Expanded = vm.column3Expanded = vm.column4Expanded = vm.column5Expanded = true;
			this.isExpandAllDisabled = true;
			this.isCollapseAllDisabled = false;
			this.setExpandCollapseClass();
		};

		vm.collapseAll = () => {
			vm.column1Expanded = vm.column2Expanded = vm.column3Expanded = vm.column4Expanded = vm.column5Expanded = false;
			this.isCollapseAllDisabled = true;
			this.isExpandAllDisabled = false;
			this.setExpandCollapseClass();
		};

		vm.setExpandCollapseButtonStatus = () => {
			this.isExpandAllDisabled = false;
			this.isCollapseAllDisabled = false;
			if (this.column1Expanded && this.column2Expanded && this.column3Expanded && this.column4Expanded && this.column5Expanded) {
				this.isExpandAllDisabled = true;
				this.isCollapseAllDisabled = false;
			}
			else if (!this.column1Expanded && !this.column2Expanded && !this.column3Expanded && !this.column4Expanded && !this.column5Expanded) {
				this.isCollapseAllDisabled = true;
				this.isExpandAllDisabled = false;
			}

			this.setExpandCollapseClass();
		};

		vm.IsColumn1Collapsed = (isCollapsed: boolean) => {
			vm.column1Expanded = !isCollapsed;
			this.setExpandCollapseButtonStatus();
		};

		vm.IsColumn2Collapsed = (isCollapsed: boolean) => {
			vm.column2Expanded = !isCollapsed;
			this.setExpandCollapseButtonStatus();
		};

		vm.IsColumn3Collapsed = (isCollapsed: boolean) => {
			vm.column3Expanded = !isCollapsed;
			this.setExpandCollapseButtonStatus();
		};

		vm.handleDateUpdate = (event) => {

			vm.caseDate = event;
			vm.arrivaldate.controlClass = '';
			vm.arrivaldate.isEmpty = false;
			if (vm.isDisabled) {
				vm.isDirty = true;
			}
		};
		vm.IsColumn4Collapsed = (isCollapsed: boolean) => {
			vm.column4Expanded = !isCollapsed;
			this.setExpandCollapseButtonStatus();
		};

		vm.IsColumn5Collapsed = (isCollapsed: boolean) => {
			vm.column5Expanded = !isCollapsed;
			this.setExpandCollapseButtonStatus();
		};

		vm.deleteCaseClick = () => {
			vm.selectedCaseIds = [vm.caseCreateDetails.caseId];
			vm.modalDeleteCase.show();
		};

		vm.deleteCase = (responseType: messageResponseType) => {
			if (responseType === messageResponseType.Yes) {
				vm.showSpinner();
				//this.loaderMessage.showLoader = true;
				//this.messageService.LoaderMessage = this.loaderMessage;
				vm.modalDeleteCase.hide();
				vm.caseCreateDetails.status = caseStatus.Deleted;
				vm.updateCase(caseStatus.Deleted);
				vm.hide();
			}
		};

		vm.validationDraftOkClick = () => {
			vm.modalValidationDraft.hide();
		};

		vm.saveAsDraftClick = () => {
			vm.checkValidations();
			if (vm.isDirty && vm.isCaseValid()) {
				vm.showSpinner();
				vm.createCase(caseStatus.Draft);
			}
			else {
				vm.modalValidationDraft.show();
			}
		};

		vm.updateCaseClick = () => {
			if (vm.pageStatus === casePageStatus.IsExistingCaseOpened || vm.pageStatus === casePageStatus.IsCreateCaseOpened) {
				vm.caseCreateDetails.caseId = vm.generatedCaseId[0];
				vm.isDisabled = false;
				vm.isExistingCaseSaveChanges = true;
			}
		};

		vm.saveChangesClick = () => {
			vm.checkValidations();
			if (vm.isCaseValid()) {
				vm.showSpinner();
				vm.updateCase(vm.existingCaseStatus);
				vm.isDisabled = true;
				vm.isExistingCaseSaveChanges = false;
			}
		};

		vm.updateDraftClick = () => {
			if (vm.isDirty) {
				vm.showSpinner();
				//this.loaderMessage.showLoader = true;
				//this.messageService.LoaderMessage = this.loaderMessage;
				vm.updateCase(caseStatus.Draft);
				vm.getGreenTickForColumn1();
				vm.getGreenTickForColumn2();
				vm.getGreenTickForColumn3();
				vm.getGreenTickForColumn4();
				vm.getGreenTickForColumn5();
				vm.resetMessages();
			}
		};

		vm.checkValidations = () => {
			// Vehicle Info
			//vm.broadcastService.broadcast(vm.plateNumber.controlId, vm.plateNumber.value);
			//vm.broadcastService.broadcast(vm.vehicleMake.controlId, vm.vehicleMake.value);
			vm.broadcastService.broadcast(vm.overallWeight.controlId, vm.overallWeight.value);
			//vm.broadcastService.broadcast(vm.driverLicense.controlId, vm.driverLicense.value);
			// Ship Info
			// Reset tooltips for Ship company , Nationality
			vm.caseCreateDetails.shipping.shipId = vm.caseCreateDetails.shipping.shipId.replace(/\s/g, '');
			vm.isShipCompanyRequired = false;
			vm.shipCompany.required = false;
			vm.isShipContainerIdRequired = false;
			vm.broadcastService.broadcast(vm.shipCompany.controlId, vm.shipCompany.value);
			vm.isNationalityRequired = false;
			vm.nationality.required = false;
			vm.caseTo.required = true;
			vm.arrivaldate.required = true;

			if (vm.selectedToCountry.id === 0) {
				vm.caseTo.controlClass = 'alert-warning';
				vm.caseTo.isEmpty = true;
			}
			if (vm.caseDate == null) {
				vm.arrivaldate.controlClass = 'alert-warning';
				vm.arrivaldate.isEmpty = true;
			}
			if (vm.containerIdValue === '') {
				vm.containerId.controlClass = 'alert-warning';
				vm.containerId.isEmpty = true;
			}

			vm.broadcastService.broadcast(vm.shipId.controlId, vm.shipId.value);
			if (vm.caseCreateDetails.shipping.shipId.trim() === '') {
				vm.caseCreateDetails.shipping.shippingCompany = '';
				vm.caseCreateDetails.shipping.contactDetails = '';
				vm.nationality.selectedValue = vm.nationalityNameList[0];

				vm.isShipCompanyRequired = false;
				vm.shipCompany.required = false;
				vm.isNationalityRequired = false;
				vm.isShipContainerIdRequired = false;
				vm.nationality.required = false;
				vm.nationality.showTooltip = false;
				vm.nationality.controlClass = '';
				vm.shipCompany.controlClass = '';
				vm.broadcastService.broadcast(vm.nationality.controlId, vm.nationality.selectedValue);
			}
			else {
				vm.isShipCompanyRequired = true;
				vm.shipCompany.required = true;
				vm.isShipContainerIdRequired = true;
				vm.broadcastService.broadcast(vm.shipCompany.controlId, vm.shipCompany.value);
				vm.broadcastService.broadcast(vm.shipContact.controlId, vm.shipContact.value);
				vm.isNationalityRequired = true;
				vm.nationality.required = true;
				if (vm.selectedNationality.id === 0) {
					vm.nationality.controlClass = 'alert-warning';
					vm.nationality.isEmpty = true;
				}
				if (vm.shipCompany.value === '') {
					vm.shipCompany.controlClass = 'alert-warning';
					vm.shipCompany.isEmpty = true;
				}
			}
			// Container Info
			vm.broadcastService.broadcast(vm.containerId.controlId, vm.containerId.value);
			vm.hsCode.textValue = vm.hsCodeValue = vm.hsCodeValue.trim();
			vm.broadcastService.broadcast(vm.hsCode.controlId, vm.hsCode.textValue);
		};

		vm.resetMessages = () => {
			vm.plateNumber.reset();
			vm.vehicleMake.reset();
			vm.overallWeight.reset();
			vm.shipId.reset();
			vm.driverLicense.reset();
			vm.shipCompany.reset();
			vm.shipContact.reset();
			vm.nationality.reset();
			vm.caseFrom.reset();
			vm.caseTo.reset();
			vm.arrivaldate.reset();
			vm.hsCode.reset();
			vm.containerId.reset();
		};

		vm.createCaseClick = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			vm.checkValidations();
			if (vm.isCaseValid()) {
				//show loader when form is valid
				vm.showSpinner();
				//this.loaderMessage.showLoader = true;
				//this.messageService.LoaderMessage = this.loaderMessage;
				//if (vm.pageStatus === vm.checkType.IsCreateCaseOpened && !vm.IsCreationSuccess ||
				//vm.pageStatus === vm.checkType.IsExistingDraftCaseOpened) {

				if (this.caseCreateDetails && this.existingCaseStatus === caseStatus.Draft) {
					vm.updateCase(caseStatus.AwaitingProfiling);
				}
				else {
					vm.createCase(caseStatus.AwaitingProfiling);
				}

			}
		};

		vm.getGreenTickForColumn1 = () => {
			let noOfInvalidField = 0;
			if (vm.caseCreateDetails.overallWeight === null || vm.caseCreateDetails.overallWeight === undefined) {
				vm.overAllWeightValue = '';
			}

			let isOverAllWeightValid = vm.commonService.overAllWeightValidator(vm.overAllWeightValue);

			if (isOverAllWeightValid && vm.selectedToCountry.id !== 0 && vm.caseDate != null) {
				vm.isCasePanelValid = 1;
				vm.warningMessageCasepanel = '';
			}
			else {
				if (!isOverAllWeightValid) {
					noOfInvalidField++;
				}
				if (vm.selectedToCountry.id === 0) {
					noOfInvalidField++;
				}
				if (vm.caseDate == null) {
					noOfInvalidField++;
				}
				vm.isCasePanelValid = 2;
				vm.warningMessageCasepanel = translateService.instant('FieldsInfoMissing', noOfInvalidField.toString());
			}

		};

		vm.getGreenTickForColumn2 = () => {
			let isShipIdValid = vm.commonService.shipIdValidator(vm.caseCreateDetails.shipping.shipId);
			let noOfInvalidFields = 0;
			if (vm.caseCreateDetails.shipping.shipId.trim() === '') {
				vm.isShipPanelValid = 1;
				vm.warningMessageShipPanel = '';
			}
			else {

				if (isShipIdValid && vm.caseCreateDetails.shipping.shippingCompany.trim() !== '' && vm.selectedNationality && vm.selectedNationality.id !== 0) {
					vm.isShipPanelValid = 1;
					vm.warningMessageShipPanel = '';
				}
				else {
					if (!isShipIdValid) {
						noOfInvalidFields++;
					}
					if (vm.caseCreateDetails.shipping.shippingCompany.trim() === '') {
						noOfInvalidFields++;
					}
					if (vm.selectedNationality && vm.selectedNationality.id === 0) {
						noOfInvalidFields++;
					}
					if (vm.caseCreateDetails.shipping.contactDetails.trim() === '') {
						noOfInvalidFields++;
					}
					vm.isShipPanelValid = 2;
					vm.warningMessageShipPanel = translateService.instant('FieldsInfoMissing', noOfInvalidFields.toString());
				}
			}
		};
		vm.getGreenTickForColumn3 = () => {
			vm.isVehiclePanelValid = 1;
		};
		vm.getGreenTickForColumn4 = () => {
			let noOfInvalidFields = 0;
			let isContainerIdValid = vm.commonService.containerIdValidator(vm.containerIdValue);
			if (vm.containerIdValue !== '' && vm.hsCode.isHsCodeValid && isContainerIdValid) {
				vm.isContainerPanelValid = 1;
				vm.warningMessageContainerPanel = '';
			}
			else {
				if (!isContainerIdValid) {
					noOfInvalidFields++;
					vm.containerId.controlClass = 'alert-warning';
				}
				if (!vm.hsCode.isHsCodeValid) {
					noOfInvalidFields++;
				}
				vm.isContainerPanelValid = 2;
				vm.warningMessageContainerPanel = translateService.instant('FieldsInfoMissing', noOfInvalidFields.toString());
			}


		};
		vm.getGreenTickForColumn5 = () => {
			vm.isAttachmentPanelValid = 1;
		};


		vm.isCaseValid = () => {
			if (vm.overallWeight === null || vm.overallWeight === undefined) {
				vm.overallWeight.value = '';
			}

			if (vm.notes === null || vm.notes === undefined) {
				vm.caseCreateDetails.notes = '';
			}
			vm.getGreenTickForColumn1();
			vm.getGreenTickForColumn2();
			vm.getGreenTickForColumn3();
			vm.getGreenTickForColumn4();
			vm.getGreenTickForColumn5();

			if (vm.hsCode.isHsCodeValid &&
				!vm.overallWeight.isOverallWeight &&
				!vm.plateNumber.isEmpty &&
				!vm.vehicleMake.isEmpty &&
				!vm.driverLicense.isEmpty &&
				!vm.containerId.isEmpty &&
				!vm.containerId.isContainerIdInValid &&
				!vm.caseFrom.isEmpty &&

				!vm.caseTo.isEmpty && !vm.arrivaldate.isEmpty
			) {
				if (vm.shipId.value.trim().length === 0) {
					return true;

				}
				else {
					if (!vm.shipId.isShipIdInValid && !vm.shipCompany.isEmpty && !vm.nationality.isEmpty) {

						return true;
					}

				}

			}

			return false;
		};


		vm.createCase = (status: caseStatus) => {
			vm.setCaseDetailValues(status);
			vm.caseCreateDetails.caseId = null;
			vm.setNewCaseDetails(status);
			vm.saveInProgress = true;
			vm.caseService.createCase(vm.newCaseDetails).subscribe(result => {
				if (result.status === responseStatus.Success) {
					this.loaderMessage.showLoader = false;
					this.messageService.LoaderMessage = this.loaderMessage;
					if (result.messageKey === 'SACM10001') {
						vm.duplicateCaseResponse = result.data;
						vm.destinationCountryName = vm.caseFromCountryNameList[Object.keys(vm.caseFromCountryCodeList).find(k => vm.caseFromCountryCodeList[k].name === vm.duplicateCaseResponse.to)].name;
						vm.sourceCountryName = vm.caseFromCountryNameList[Object.keys(vm.caseFromCountryCodeList).find(k => vm.caseFromCountryCodeList[k].name === vm.duplicateCaseResponse.from)].name;
						vm.statusName = vm.caseStatusList[Object.keys(vm.caseStatusList).find(k => vm.caseStatusList[k].id === vm.newCaseDetails.status)].name;
						vm.modalMatchCase.show();
						vm.saveInProgress = false;
					}
					else {
						let newAttachments = vm.attachments.filter((item) => {
							if (item.rawFile) {
								delete item.rawFile;
							}
							return (!item.id || item.id === '0');
						});

						if (newAttachments.length) {
							this.loaderMessage.showLoader = true;
							this.messageService.LoaderMessage = this.loaderMessage;
							vm.attachmentService.postAttachment(newAttachments, result.data.caseId).subscribe((status) => {
								this.loaderMessage.showLoader = false;
								this.messageService.LoaderMessage = this.loaderMessage;
								vm.caseCreationCallBack(result, status);
							}, (error: IResponse<any>) => {
								this.loaderMessage.showLoader = false;
								this.messageService.LoaderMessage = this.loaderMessage;
								vm.saveInProgress = false;
								vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
							});
						} else {
							vm.caseCreationCallBack(result);
						}
					}
				}
				else {
					vm.saveInProgress = false;
					this.loaderMessage.showLoader = false;
					this.messageService.LoaderMessage = this.loaderMessage;
					vm.messageService.Message = { message: result.messageKey, showMessage: false, type: messageType.Error };
				}
			},
				(error: IResponse<any>) => {
					this.loaderMessage.showLoader = false;
					this.messageService.LoaderMessage = this.loaderMessage;
					vm.saveInProgress = false;
					vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				}
			);
		};



		vm.caseCreationCallBack = (result: IResponse<ICaseCreateDetails>, status: IResponse<IAttachment>[]) => {
			vm.saveInProgress = false;
			vm.caseStatus = vm.caseStatusList[Object.keys(vm.caseStatusList).find(k => vm.caseStatusList[k].id === result.data.status)].name;
			vm.caseService.getCaseDetailById(result.data.caseId).subscribe((response) => {
				response.data.attachments && response.data.attachments.length && vm.refreshAttachmentGrid(response.data.attachments);
			});

			if (vm.caseStatus === vm.translateService.instant('AwaitingProfiling')) {
				vm.IsCreationSuccess = true;
				vm.IsDraftCreationSuccess = false;
				vm.isDisabled = true;
				vm.isShipDisabled = true;
			}

			if (vm.caseStatus === vm.translateService.instant('Draft')) {
				vm.IsDraftCreationSuccess = true;
				vm.IsCreationSuccess = false;
				vm.caseCreateDetails.caseId = result.data.caseId;
				//vm.caseCreateDetails.lastUpdateDate = result.data.lastUpdateDate;
				vm.caseCreateDetails.lastUpdatedBy = result.data.lastUpdatedBy;
			}

			vm.isDirty = false;
			vm.generatedCaseId = [result.data.caseId];
			vm.caseCreateDetails.caseId = result.data.caseId;
			vm.caseCreateDetails.lastUpdateDate = vm.dateFormatService.operationalDate(result.data.lastUpdateDate);
			vm.caseCreateDetails.lastUpdatedBy = result.data.lastUpdatedBy;
			vm.broadcastService.broadcast(broadcastKeys[broadcastKeys.refreshCaseList], null);
			vm.existingCaseStatus = result.data.status;
		};

		vm.setCaseDetailValues = (status: caseStatus) => {
			vm.containersList = [];
			vm.caseCreateDetails.status = status;
			vm.caseCreateDetails.lastUpdateDate = null;
			vm.caseCreateDetails.lastUpdatedBy = null;
			vm.caseCreateDetails.from = vm.caseFromCountryCodeList[Object.keys(vm.caseFromCountryCodeList).find(k => vm.caseFromCountryCodeList[k].id === vm.selectedFromCountry.id)].name;
			vm.caseCreateDetails.to = vm.caseToCountryCodeList[Object.keys(vm.caseToCountryCodeList).find(k => vm.caseToCountryCodeList[k].id === vm.selectedToCountry.id)].name;
			if (vm.sourcePortList.length > 0 && vm.selectedOriginalPort) {
				vm.caseCreateDetails.originPortCode = vm.sourcePortList[Object.keys(vm.sourcePortList).find(k => vm.sourcePortList[k].id === vm.selectedOriginalPort.id)].id;
			}
			if (vm.destinationPortList.length > 0 && vm.selectedDestinationPort) {
				vm.caseCreateDetails.destinationPortCode = vm.destinationPortList[Object.keys(vm.destinationPortList).find(k => vm.destinationPortList[k].id === vm.selectedDestinationPort.id)].id;
			}
			if (vm.caseDate === null) {
				vm.caseCreateDetails.dateOfArrival = null;
			}
			else {
				vm.caseCreateDetails.dateOfArrival = vm.dateFormatService.formatDateforApi(vm.caseDate);
			}
			if (vm.selectedCargoType) {
				vm.caseCreateDetails.cargoType = vm.selectedCargoType.id;
			}
			let container: IContainer = { containerId: '0', harmonisedSystemCodes: [] };
			container.containerId = vm.containerId.value;
			container.harmonisedSystemCodes = vm.hsCode.textValue.split(',');
			vm.containersList.push(container);
			vm.caseCreateDetails.containers = vm.containersList;
			vm.caseCreateDetails.shipping.nationality = vm.nationalityCodeList[Object.keys(vm.nationalityCodeList).find(k => vm.nationalityCodeList[k].id === vm.selectedNationality.id)].name;

			if (vm.overallWeight.value === '') {
				vm.caseCreateDetails.overallWeight = null;
			}
			else {
				vm.caseCreateDetails.overallWeight = parseInt(vm.overallWeight.value);
			}

		};

		vm.updateCase = (status: caseStatus) => {
			vm.setCaseDetailValues(status);
			vm.setNewCaseDetails(status);
			vm.saveInProgress = true;
			let updatedAttachments = vm.attachments.filter((attachment) => {
				return attachment.id;
			});

			if (vm.deletedAttachments && vm.deletedAttachments.length > 0) {
				updatedAttachments = updatedAttachments.concat(vm.deletedAttachments);
				vm.deletedAttachments = [];
			}

			vm.newCaseDetails.attachments = updatedAttachments;
			vm.caseService.updateCase(vm.newCaseDetails).subscribe(result => {
				if (result.status === responseStatus.Success) {
					this.loaderMessage.showLoader = false;
					this.messageService.LoaderMessage = this.loaderMessage;
					let newAttachments = vm.attachments.filter((attachment) => {
						return !attachment.id;
					});

					if (newAttachments.length) {
						this.loaderMessage.showLoader = true;
						this.messageService.LoaderMessage = this.loaderMessage;
						vm.attachmentService.postAttachment(newAttachments, result.data.caseId).subscribe((status) => {
							this.loaderMessage.showLoader = false;
							this.messageService.LoaderMessage = this.loaderMessage;
							vm.caseUpdationCallBack(result, status);
						}, (error: IResponse<any>) => {
							this.loaderMessage.showLoader = false;
							this.messageService.LoaderMessage = this.loaderMessage;
							vm.saveInProgress = false;
							vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
						});
					} else {
						vm.caseUpdationCallBack(result);
					}
				}
				else if (result.status === responseStatus.Timeout) {
					vm.saveInProgress = false;
				}
				else {
					vm.saveInProgress = false;
					vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
				}
			},
				(error: IResponse<any>) => {
					this.loaderMessage.showLoader = false;
					this.messageService.LoaderMessage = this.loaderMessage;
					vm.saveInProgress = false;
					vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				}
			);

		};

		vm.caseUpdationCallBack = (result: IResponse<ICaseCreateDetails>, status: IResponse<IAttachment>[]) => {
			vm.saveInProgress = false;
			vm.caseStatus = vm.caseStatusList[Object.keys(vm.caseStatusList).find(k => vm.caseStatusList[k].id === result.data.status)].name;
			vm.caseService.getCaseDetailById(result.data.caseId).subscribe((response) => {
				response.data.attachments && response.data.attachments.length && vm.refreshAttachmentGrid(response.data.attachments);
			});
			if (vm.caseStatus === vm.translateService.instant('AwaitingProfiling')) {
				vm.IsCreationSuccess = true;
				vm.IsDraftCreationSuccess = false;
				vm.isDisabled = true;
			}
			if (vm.caseStatus === vm.translateService.instant('Draft')) {
				vm.IsDraftCreationSuccess = true;
				vm.caseCreateDetails.caseId = result.data.caseId;
				//vm.caseCreateDetails.lastUpdateDate = result.data.lastUpdateDate;
				vm.caseCreateDetails.lastUpdatedBy = result.data.lastUpdatedBy;
			}
			if (vm.pageStatus === vm.checkType.IsExistingDraftCaseOpened && vm.caseStatus === vm.translateService.instant('AwaitingProfiling')) {
				vm.IsCreationSuccess = true;
				vm.IsDraftCreationSuccess = false;
				vm.isDisabled = true;
				vm.pageStatus = vm.checkType.IsExistingCaseOpened;
			}

			vm.isDirty = false;
			vm.generatedCaseId = [result.data.caseId];
			vm.existingCaseStatus = result.data.status;
			vm.caseCreateDetails.lastUpdateDate = vm.dateFormatService.operationalDate(result.data.lastUpdateDate);
			vm.caseCreateDetails.lastUpdatedBy = result.data.lastUpdatedBy;
			vm.broadcastService.broadcast(broadcastKeys[broadcastKeys.refreshCaseList], null);
		};

		vm.reset = () => {
			vm.saveInProgress = false;
			vm.caseStatus = '-';
			vm.overAllWeightValue = '';
			vm.caseDate = null;
			vm.caseCreateDetails.dateOfArrival = '';
			vm.caseCreateDetails.senderName = '';
			vm.caseCreateDetails.senderAddress = '';
			vm.caseCreateDetails.overallWeight = 0;
			vm.caseCreateDetails.notes = '';
			vm.caseCreateDetails.shipping.shipId = '';
			vm.caseCreateDetails.shipping.shippingCompany = '';
			vm.caseCreateDetails.shipping.contactDetails = '';
			vm.caseCreateDetails.vehicle.licensePlateNumber = '';
			vm.caseCreateDetails.vehicle.make = '';
			vm.caseCreateDetails.vehicle.driverName = '';
			vm.caseCreateDetails.vehicle.company = '';
			vm.caseCreateDetails.vehicle.model = '';
			vm.caseCreateDetails.vehicle.driverLicenseNumber = '';
			for (let container in vm.caseCreateDetails.containers) {
				vm.caseCreateDetails.containers[container].containerId = '';
				vm.caseCreateDetails.containers[container].harmonisedSystemCodes = [];
			}
			vm.selectedFromCountry = vm.caseFromCountryNameList[0];
			vm.selectedToCountry = vm.caseToCountryNameList[0];
			vm.selectedNationality = vm.nationalityNameList[0];
			vm.sourcePortList = [];
			vm.destinationPortList = [];
			vm.selectedOriginalPort = vm.sourcePortList[0];
			vm.selectedDestinationPort = vm.destinationPortList[0];
			vm.caseCreateDetails.status = -1;
			vm.caseCreateDetails.lastUpdateDate = '';
			vm.caseCreateDetails.lastUpdatedBy = '-';
			vm.selectedCargoType = vm.cargoTypesList[0];
			vm.broadcastService.broadcast('pageReset', null);
			vm.isCasePanelValid = 0;
			vm.isShipPanelValid = 0;
			vm.isContainerPanelValid = 0;
			vm.isVehiclePanelValid = 0;
			vm.isAttachmentPanelValid = 0;
			vm.warningMessageShipPanel = '';
			vm.warningMessageCasepanel = '';
			vm.warningMessageContainerPanel = '';
			vm.setDefaultColumnSettings();
			vm.isDisabled = false;
			vm.IsCreationSuccess = false;
			vm.IsDraftCreationSuccess = false;
			vm.pageStatus = casePageStatus.IsCreateCaseOpened;
			vm.pageTitle = translateService.instant('ManualCaseCreation');
			vm.isExistingCaseSaveChanges = false;
			vm.isDirty = false;
			vm.generatedCaseId = ['-'];
			vm.containerIdValue = '';
			vm.hsCodeValue = '';
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			vm.attachments = [];
			vm.oldAttachments = [];
			vm.deletedAttachments = [];
			vm.selectedAttachments = [];
		};

		vm.downloadAttachment = (event: IAttachment) => {
			if (!event.id || event.id === '0') {
				vm.attachmentService.downloadLocalFile(event);
			}
			else {
				vm.attachmentService.getAttachmentByAttachmentId(event.id, event.downloadPath, event.fileType);
			}

		};
		vm.getCaseMetadata = () => {
			vm.isDisabled = false;
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			this.caseService.fetchMetadata().subscribe(result => {
				if (result.status === responseStatus.Success) {
					this.caseStatusList = result.data.CargoStatus;
					vm.cargoTypesList = result.data.CargoType;
					vm.reasonType = result.data.ReasonType;
					vm.reasonType.unshift({ id: 0, name: '' }); //added this type as it is required in select control
					vm.reasonType.pop();  //removed last element of array.
					vm.selectedCargoType = vm.cargoTypesList[0];
				}
			});

			vm.caseService.fetchCaseCountryData().subscribe(result => {
				if (result.status === responseStatus.Success) {
					let countryIndex = 0;
					vm.caseFromCountryCodeList.push({ id: 0, name: '' });
					vm.caseFromCountryNameList.push({ id: 0, name: '' });
					vm.caseToCountryCodeList.push({ id: 0, name: '' });
					vm.caseToCountryNameList.push({ id: 0, name: '' });
					vm.sourcePortList.push({ id: 0, name: '' });
					vm.destinationPortList.push({ id: 0, name: '' });
					vm.countryData = result.data;
					for (let country in result.data) {
						let countryName: IKeyValue = {
							id: 0,
							name: ''
						};
						let countryCode: IKeyValue = {
							id: 0,
							name: ''
						};
						countryIndex++;
						countryName.id = countryIndex;
						countryName.name = result.data[country].name.trim();
						countryCode.id = countryIndex;
						countryCode.name = result.data[country].code.trim();
						vm.caseFromCountryCodeList.push(countryCode);
						vm.caseFromCountryNameList.push(countryName);
						vm.caseToCountryCodeList.push(countryCode);
						vm.caseToCountryNameList.push(countryName);
					}
					if (Array.isArray(vm.caseFromCountryNameList) && vm.caseFromCountryNameList.length > 0) {
						vm.selectedFromCountry = vm.caseFromCountryNameList[0];
						vm.selectedToCountry = vm.caseToCountryNameList[0];
					}
				}
			});
			vm.caseService.fetchCaseCreateMetaData(metaDataSettings.Cases).subscribe(result => {
				if (result.status === responseStatus.Success) {
					vm.reset();
					vm.caseNotes = '';
					vm.IsCreationSuccess = false;
					vm.IsDraftCreationSuccess = false;
					//vm.caseStatusList = result.data.CargoStatus;


					let nationalityIndex = 0;
					vm.nationalityNameList.push({ id: 0, name: '' });
					vm.nationalityCodeList.push({ id: 0, name: '' });
					for (let nationality in result.data.Country) {
						let nationalityName: IKeyValue = {
							id: 0,
							name: ''
						};
						let nationalityCode: IKeyValue = {
							id: 0,
							name: ''
						};
						nationalityIndex++;
						nationalityName.id = nationalityIndex;
						nationalityName.name = result.data.Country[nationality].name.trim();
						nationalityCode.id = nationalityIndex;
						nationalityCode.name = result.data.Country[nationality].code.trim();
						vm.nationalityNameList.push(nationalityName);
						vm.nationalityCodeList.push(nationalityCode);
					}


					if (vm.nationalityNameList.length > 0) {
						vm.selectedNationality = vm.nationalityNameList[0];
					}


				}
				else {
					vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
				}
			},
				(error: IResponse<any>) => {
					vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				}
			);
		};




		vm.onSelectChanged = (key: string, selectValue: IKeyValue) => {
			vm.isDirty = true;

			switch (key) {
				case 'nationality':
					vm.nationality.controlClass = '';
					vm.nationality.isEmpty = false;
					break;
				case 'caseFrom':
					vm.caseFrom.controlClass = '';
					vm.caseFrom.isEmpty = false;
					break;
				case 'caseTo':
					vm.caseTo.controlClass = '';
					vm.caseTo.isEmpty = false;
					break;
			}
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			vm.countryData.forEach(ele => {
				if (ele.name === selectValue.name) {
					if (key === 'caseFrom') {
						vm.sourcePortList = [];
						ele.ports.forEach(port => {
							vm.sourcePortList.push({ 'id': port.portCode, 'name': port.portName });
						});
						vm.selectedOriginalPort = vm.sourcePortList[0];
					}
					else if (key === 'caseTo') {
						vm.destinationPortList = [];
						ele.ports.forEach(port => {
							vm.destinationPortList.push({ 'id': port.portCode, 'name': port.portName });
						});
						vm.selectedDestinationPort = vm.destinationPortList[0];
					}
				}
			});
		};

		vm.toggleClick = (response: any) => {

			if (response.status === messageResponseType.No || response.status === messageResponseType.Yes) {
				vm.hide();
			}
		};

		vm.closeClick = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			if (vm.isDirty) {
				vm.modalClose.show();
			}
			else {

				vm.reset();
				this.IsCreationSuccess = false;
				this.IsDraftCreationSuccess = false;
				this.isShipPanelValid = 1;
				this.isCasePanelValid = 1;
				this.isContainerPanelValid = 1;
				this.isVehiclePanelValid = 1;
				this.isAttachmentPanelValid = 1;
				vm.warningMessageShipPanel = '';
				vm.warningMessageContainerPanel = '';
				this.isDirty = false;
				vm.hide();
			}
		};

		vm.closeModal = () => {
			vm.modalClose.hide();
		};
		vm.leaveClick = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };

			vm.modalClose.hide();
			vm.reset();

			vm.hide();
		};

		vm.backClick = () => {
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
			vm.modalClose.hide();
		};
		vm.onCargoTypeChange = (selType: IKeyValue) => {
			vm.isDirty = true;
		};
		vm.onTextAdded = (key: SpTextboxComponent) => {
			vm.isDirty = true;
			if (key.value === '' || key.value == null) {
				key.controlClass = '';
			}
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
		};
		vm.onShipIdTextAdded = (key: SpTextboxComponent) => {
			vm.isDirty = true;
			let isShipIdValid = vm.commonService.shipIdValidator(vm.shipId.value.trim());
			if (vm.shipId && vm.shipId.value.trim().length !== 0 && isShipIdValid) {
				vm.isShipCompanyRequired = true;
				vm.isNationalityRequired = true;
				if (vm.shipId.value == null) {
					vm.isShipDisabled = true;

				}
				else {
					vm.isShipDisabled = false;
				}
			}
			else {
				vm.isShipCompanyRequired = false;
				vm.isNationalityRequired = false;
				if (vm.shipId.value === null || vm.shipId.value === '') {
					vm.isShipDisabled = true;
					vm.shipCompany.isMessageShown = false;
					vm.nationality.isEmpty = false;
					vm.nationality.controlClass = '';
					vm.shipCompany.controlClass = '';
					vm.shipCompany.value = '';
					vm.shipContact.value = '';
					vm.selectedNationality = vm.nationalityNameList[0];
				}
				else {
					vm.isShipDisabled = false;
				}
			}
		};
		vm.onNotesTextAdded = (key: SpMultiTextboxComponent) => {
			vm.isDirty = true;
			if (key.textValue === '') {
				vm.broadcastService.broadcast('caseNotesReset', null);
			}
			vm.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
		};
		vm.show = () => {
			this.visible = true;
			vm.reset();
			setTimeout(() => this.visibleAnimate = true);
		};

		vm.hide = () => {
			vm.reset();
			this.visibleAnimate = false;
			setTimeout(() => this.visible = false, 1);
		};
		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((resultCase: IKeyData) => {
			if (resultCase.key === 'existingCaseDetails') {
				vm.loaderMessage.showLoader = true;
				vm.messageService.LoaderMessage = this.loaderMessage;
				vm.caseService.getCaseDetailById(resultCase.data).subscribe(result => {
					if (result.status === responseStatus.Success) {
						vm.loaderMessage.showLoader = false;
						vm.messageService.LoaderMessage = this.loaderMessage;
				
						let existingCaseDetails: ICaseCreateDetails = result.data;
						vm.caseCreateDetails.senderName = existingCaseDetails.senderName;
						vm.caseCreateDetails.senderAddress = existingCaseDetails.senderAddress;
						if (existingCaseDetails.overallWeight !== null) {
							vm.overAllWeightValue = existingCaseDetails.overallWeight.toString();
						}
						else {
							vm.overAllWeightValue = '';
						}
						vm.caseCreateDetails.notes = existingCaseDetails.notes;
						if (existingCaseDetails.from === '') {
							vm.selectedFromCountry = vm.caseFromCountryNameList[0];
						}
						else {
							vm.selectedFromCountry = vm.caseFromCountryNameList[Object.keys(vm.caseFromCountryCodeList).find(k => vm.caseFromCountryCodeList[k].name === existingCaseDetails.from)];
						}

						if (existingCaseDetails.to === '') {
							vm.selectedToCountry = vm.caseToCountryNameList[0];
						}
						else {
							vm.selectedToCountry = vm.caseToCountryNameList[Object.keys(vm.caseToCountryCodeList).find(k => vm.caseToCountryCodeList[k].name === existingCaseDetails.to)];
						}
						if (vm.countryData) {
							vm.countryData.forEach(country => {
								if (country.code === existingCaseDetails.from) {
									vm.sourcePortList = [];
									country.ports.forEach(item => {
										vm.sourcePortList.push({ 'id': item.portCode, 'name': item.portName });
									});
								}
								if (country.code === existingCaseDetails.to) {
									vm.destinationPortList = [];
									country.ports.forEach(item => {
										vm.destinationPortList.push({ 'id': item.portCode, 'name': item.portName });
									});
								}
							});
						}
						// Origin Port
						if (existingCaseDetails.originPortCode === '') {
							vm.selectedOriginalPort = vm.sourcePortList[0];
						}
						else {
							vm.selectedOriginalPort = vm.sourcePortList[Object.keys(vm.sourcePortList).find(k => vm.sourcePortList[k].id === existingCaseDetails.originPortCode)];
						}
						// Destination Port
						if (existingCaseDetails.destinationPortCode === '') {
							vm.selectedDestinationPort = vm.destinationPortList[0];
						}
						else {
							vm.selectedDestinationPort = vm.destinationPortList[Object.keys(vm.destinationPortList).find(k => vm.destinationPortList[k].id === existingCaseDetails.destinationPortCode)];
						}

						if (existingCaseDetails.dateOfArrival !== null && existingCaseDetails.dateOfArrival !== '') {
							vm.caseDate = this.dateFormatService.operationalDate(existingCaseDetails.dateOfArrival);
						}
						else {
							vm.caseDate = null;
						}
						//panel 2
						if (existingCaseDetails.shipping !== null) {
							vm.caseCreateDetails.shipping.shipId = existingCaseDetails.shipping.shipId;
							vm.caseCreateDetails.shipping.shippingCompany = existingCaseDetails.shipping.shippingCompany;
							vm.caseCreateDetails.shipping.contactDetails = existingCaseDetails.shipping.contactDetails;
							if (existingCaseDetails.shipping.nationality === null || existingCaseDetails.shipping.nationality === '' || existingCaseDetails.shipping.nationality === undefined) {
								vm.selectedNationality = vm.nationalityNameList[0];
							}
							else {
								vm.selectedNationality = vm.nationalityNameList[Object.keys(vm.nationalityCodeList).find(k => vm.nationalityCodeList[k].name === existingCaseDetails.shipping.nationality.trim())];
							}
						}
						else {
							vm.selectedNationality = vm.nationalityNameList[0];
						}

						//panel 3
						vm.caseCreateDetails.vehicle.licensePlateNumber = existingCaseDetails.vehicle.licensePlateNumber;
						vm.caseCreateDetails.vehicle.company = existingCaseDetails.vehicle.company;
						vm.caseCreateDetails.vehicle.make = existingCaseDetails.vehicle.make;
						vm.caseCreateDetails.vehicle.model = existingCaseDetails.vehicle.model;
						vm.caseCreateDetails.vehicle.driverName = existingCaseDetails.vehicle.driverName;
						vm.caseCreateDetails.vehicle.driverLicenseNumber = existingCaseDetails.vehicle.driverLicenseNumber;

						//panel 4
						if (existingCaseDetails.containers != null) {
							vm.containerIdValue = existingCaseDetails.containers[0].containerId;
							if (existingCaseDetails.containers[0].harmonisedSystemCodes !== null) {
								vm.hsCodeValue = existingCaseDetails.containers[0].harmonisedSystemCodes.join(',');
							}
						}
						else {
							vm.containerIdValue = '';
							vm.hsCodeValue = '';
						}

						//general values
						vm.generatedCaseId = [existingCaseDetails.caseId];
						vm.selectedCargoType = vm.cargoTypesList[Object.keys(vm.cargoTypesList).find(k => vm.cargoTypesList[k].id === existingCaseDetails.cargoType)];
						vm.caseCreateDetails.lastUpdateDate = vm.dateFormatService.operationalDate(existingCaseDetails.lastUpdateDate);
						vm.caseCreateDetails.lastUpdatedBy = existingCaseDetails.lastUpdatedBy;
						vm.caseStatus = vm.caseStatusList[Object.keys(vm.caseStatusList).find(k => vm.caseStatusList[k].id === existingCaseDetails.status)].name;
						vm.existingCaseStatus = existingCaseDetails.status;
						if (existingCaseDetails.attachments && existingCaseDetails.attachments.length) {
							vm.refreshAttachmentGrid(existingCaseDetails.attachments);
						}
						if (vm.caseStatus.trim() === vm.translateService.instant('Draft')) {
							vm.isDisabled = false;
							vm.pageStatus = casePageStatus.IsExistingDraftCaseOpened;
							vm.pageTitle = translateService.instant('CaseDetails');
							vm.IsDraftCreationSuccess = true;
							vm.IsCreationSuccess = false;
							vm.caseCreateDetails.caseId = existingCaseDetails.caseId;
						}
						else {
							vm.isDisabled = true;
							vm.pageStatus = casePageStatus.IsExistingCaseOpened;
							vm.pageTitle = translateService.instant('CaseDetails');
						}

						vm.getGreenTickForColumn1();
						vm.getGreenTickForColumn2();
						vm.getGreenTickForColumn3();
						vm.getGreenTickForColumn4();
						vm.getGreenTickForColumn5();
						vm.collapseAll();
						vm.isDirty = false;
					}
				}, (error)=> {
					vm.loaderMessage.showLoader = false;					
				});
			}
		});
		vm.setNewCaseDetails = (status: caseStatus) => {
			vm.newCaseDetails = {
				caseId: null,
				cargoType: 0,
				senderName: '',
				senderAddress: '',
				from: '',
				to: '',
				originPortCode: '',
				destinationPortCode: '',
				dateOfArrival: '',
				overallWeight: 0,
				notes: '',
				shipping: {
					shipId: '',
					shippingCompany: '',
					contactDetails: '',
					nationality: ''
				},
				vehicle: {
					licensePlateNumber: '',
					make: '',
					driverName: '',
					company: '',
					model: '',
					driverLicenseNumber: ''
				},
				containers: [{
					containerId: '',
					harmonisedSystemCodes: []
				}],
				lastUpdateDate: '',
				lastUpdatedBy: '',
				status: 0,
				locationcode: ''

			};
			vm.newCaseDetails.caseId = vm.caseCreateDetails.caseId;
			vm.newCaseDetails.status = vm.caseCreateDetails.status;
			vm.newCaseDetails.cargoType = vm.caseCreateDetails.cargoType;
			vm.newCaseDetails.containers = vm.caseCreateDetails.containers;
			if (vm.newCaseDetails.containers[0].harmonisedSystemCodes[0] === '') {
				vm.newCaseDetails.containers[0].harmonisedSystemCodes = [];
			}
			vm.newCaseDetails.overallWeight = vm.caseCreateDetails.overallWeight;
			vm.newCaseDetails.senderName = vm.caseCreateDetails.senderName;
			vm.newCaseDetails.senderAddress = vm.caseCreateDetails.senderAddress;
			vm.newCaseDetails.from = vm.caseCreateDetails.from;
			vm.newCaseDetails.to = vm.caseCreateDetails.to;
			vm.newCaseDetails.vehicle = vm.caseCreateDetails.vehicle;
			vm.newCaseDetails.lastUpdateDate = vm.caseCreateDetails.lastUpdateDate;
			vm.newCaseDetails.lastUpdatedBy = vm.caseCreateDetails.lastUpdatedBy;
			vm.newCaseDetails.notes = vm.caseCreateDetails.notes;
			vm.newCaseDetails.dateOfArrival = vm.caseCreateDetails.dateOfArrival;
			vm.newCaseDetails.locationcode = localStorage.getItem('locationCode');
			vm.newCaseDetails.originPortCode = vm.caseCreateDetails.originPortCode;
			vm.newCaseDetails.destinationPortCode = vm.caseCreateDetails.destinationPortCode;

			if ((vm.caseCreateDetails.shipping.shipId === '' || vm.caseCreateDetails.shipping === null) && (status !== caseStatus.Draft)) {
				vm.newCaseDetails.shipping = null;
			}
			else {
				vm.newCaseDetails.shipping.shipId = vm.caseCreateDetails.shipping.shipId;
				vm.newCaseDetails.shipping.contactDetails = vm.caseCreateDetails.shipping.contactDetails;
				vm.newCaseDetails.shipping.shippingCompany = vm.caseCreateDetails.shipping.shippingCompany;
				vm.newCaseDetails.shipping.nationality = vm.caseCreateDetails.shipping.nationality;
			}
		};
	}
	ngOnInit() {
		this.getCaseMetadata();
		this.reset();

	}
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
