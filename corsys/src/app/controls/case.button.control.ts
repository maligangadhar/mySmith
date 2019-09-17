import { Component, Input, ViewChild, Output, OnInit, Inject, EventEmitter } from '@angular/core';

import { ICaseRequestFormat, IKeyValue, ICustomMessageResponse, ILoaderMessage, IResponse } from '../models/viewModels';
import { ICaseService, IBroadcastService, IMessageService, ITranslateService } from '../interfaces/interfaces';
import { caseButtonTypes, messageResponseType, reasonType, caseStatus, broadcastKeys, responseStatus, caseActions, action, spinnerType, messageType } from '../models/enums';

import { ModalCaseAlertComponent } from '../components/modal/modal.case.alert.component';
import { ModalCaseCancelReasonComponent } from '../components/modal/modal.casecancelreason.component';

import { ModalPromptComponent } from '../components/modal/modal.prompt.component';
import { ModalCasePromptComponent } from '../components/modal/modal.case.action.prompt.component';
import { CaseButtonStatusCode } from '../businessConstants/businessConstants';
import { ModalClearCasePopupComponent } from '../components/modal/modal.clearcase.component';
import { ModalCaseDecisionCentreActionComponent } from '../components/modal/modal.case.decisioncentre.action.component';
import { ModalDuplicateActionComponent } from '../components/modal/modal.duplicateAction.component';


@Component({
	selector: 'sp3-comp-casebutton',
	templateUrl: './case.button.control.html'
})

export class SPButtonComponent implements OnInit {

	@ViewChild('modalDuplicateActionPopUp') modalDuplicateActionPopUp: ModalDuplicateActionComponent;
	@ViewChild('modalCaseAlert') modalCaseAlert: ModalCaseAlertComponent;
	@ViewChild('modalCancelReason') modalCancelReason: ModalCaseCancelReasonComponent;
	@ViewChild('modalPrompt') modalPrompt: ModalPromptComponent;
	@ViewChild('modalCaseAction') modalCaseAction: ModalCasePromptComponent;
	@ViewChild('modalCaseImagePopup') modalCaseImagePopup: ModalClearCasePopupComponent;
	@ViewChild('modalCaseDecisionCentrePopup') modalCaseDecisionCentrePopup: ModalCaseDecisionCentreActionComponent;
	@ViewChild('modalFailureCaseDecisionCentrePopup') modalFailureCaseDecisionCentrePopup: ModalCaseDecisionCentreActionComponent;
	@Input() public buttontitle: string;
	@Input() public caseButtonType: caseButtonTypes;
	@Input() public caseIds: string[];
	@Input() public buttonClass: string;
	@Input() public buttonid: string;
	@Input() public disableButton: boolean = false;
	@Input() public reasonsTypes: IKeyValue[];
	@Input() public inspectionTypes: IKeyValue[] = [];
	@Input() public pageTitle: string;
	@Output() public callBackParent = new EventEmitter<any>();
	@Output() public duplicateAction = new EventEmitter<messageType>();
	@Output() public callBackLeaveMessage = new EventEmitter<messageResponseType>();
	query: string;
	failureCaseList: string[] = [];
	payLoad: ICaseRequestFormat = {
		cases: [{ caseId: '', caseAction: null, assignedTo: null }], status: 0, reason: null, notes: null
	};
	status: number;

	onButtonClick: () => void;
	buttonClick: () => void;
	modalCaseAlertClick: (response: messageResponseType) => void;
	modalCaseDecisionCentrePopupClick: (response: ICustomMessageResponse<string>) => void;
	modalCancelReasonClick: (response) => void;
	modalPromptClick: (response) => void;
	modalCasePromptClick: (response) => void;
	modalCaseImagePopupClick: (response: ICustomMessageResponse<string>) => void;
	setQueryString: () => void;
	sendData: (response) => void;
	conditionalPopUpDisplay: (status: caseButtonTypes) => void;
	statusCodeSetter: (statusCode: caseButtonTypes) => number;
	captureCloseAction: (response: messageType) => void;
	messageCode: string = '';
	globalResponseHolder: any;
	loaderMessage: ILoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: true, type: spinnerType.small };
	constructor( @Inject('ICaseService') caseService: ICaseService,
		@Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('ITranslateService') private translateService: ITranslateService,
		@Inject('IMessageService') private messageService: IMessageService) {

		var vm = this;
		vm.messageService.OperationGoAhead.subscribe(item => {
			if (item && item.operationAllowed && vm.caseButtonType === caseButtonTypes.ClearOnImage && item.from === action.imageClearVerdictButtonClick) {
				this.messageService.resetPageChange();
				vm.callBackLeaveMessage.emit(messageResponseType.NoPopupShown);
			}
			else if (item && item.from === action.imageClearVerdictButtonClick && vm.caseButtonType === caseButtonTypes.ClearOnImage) {
				this.messageService.resetPageChange();
				vm.callBackLeaveMessage.emit(messageResponseType.PopupShown);
				vm.buttonClick();
			}
			else if (item && item.operationAllowed && item.from === action.imageSuspectVerdictButtonClick && vm.caseButtonType === caseButtonTypes.SuspectOnImage) {
				this.messageService.resetPageChange();
				vm.callBackLeaveMessage.emit(messageResponseType.NoPopupShown);
			}
			else if (item && item.from === action.imageSuspectVerdictButtonClick && vm.caseButtonType === caseButtonTypes.SuspectOnImage) {
				this.messageService.resetPageChange();
				vm.callBackLeaveMessage.emit(messageResponseType.PopupShown);
				vm.buttonClick();
			}
		});

		vm.onButtonClick = () => {
			if (vm.caseButtonType === caseButtonTypes.ClearOnImage && this.messageService.showLeaveMessage(action.imageClearVerdictButtonClick)) {
				this.messageService.LeaveMessage = { key: 'Image Analyser', showMessage: true, type: action.imageClearVerdictButtonClick, message: 'ImageSaveMessage' };
			}
			else if (vm.caseButtonType === caseButtonTypes.SuspectOnImage && this.messageService.showLeaveMessage(action.imageSuspectVerdictButtonClick)) {
				this.messageService.LeaveMessage = { key: 'Image Analyser', showMessage: true, type: action.imageSuspectVerdictButtonClick, message: 'ImageSaveMessage' };
			}
			else {
				vm.buttonClick();
			}
		};

		vm.buttonClick = () => {
			vm.setQueryString();
			vm.conditionalPopUpDisplay(vm.caseButtonType);
		};

		vm.statusCodeSetter = (code): number => {
			return CaseButtonStatusCode[caseButtonTypes[code]];
		};

		vm.captureCloseAction = (status: messageType) => {
			vm.duplicateAction.emit(status);
			vm.broadcastService.broadcast(broadcastKeys[broadcastKeys.refreshCaseList], null);
		};

		vm.setQueryString = () => {
			if (vm.caseButtonType === caseButtonTypes.ClearAllSelected) {
				vm.query = 'ClearAllSelectedQuestion';
			}

			if (vm.caseButtonType === caseButtonTypes.CancelAllSelected) {
				vm.query = 'CancelAllSelectedQuestion';
			}

			if (vm.caseButtonType === caseButtonTypes.ScanAllSelected) {
				vm.query = 'ScanAllSelectedQuestion';
			}

			if (vm.caseButtonType === caseButtonTypes.DeleteAllSelected) {
				vm.query = 'DeleteCaseQuestion';
			}

			if (vm.caseButtonType === caseButtonTypes.Clear) {
				vm.query = 'ClearCaseQuestion';
			}

			if (vm.caseButtonType === caseButtonTypes.Scan) {
				vm.query = 'ScanCaseQuestion';
			}

			if (vm.caseButtonType === caseButtonTypes.CancelCase) {
				vm.query = 'CancelCaseQuestion';
			}
			if (vm.caseButtonType === caseButtonTypes.Inspect) {
				vm.query = 'Inspect';
			}
			if (vm.caseButtonType === caseButtonTypes.Suspect) {
				vm.query = 'Suspect';
			}
			if (vm.caseButtonType === caseButtonTypes.ReScanCase) {
				vm.query = 'ReScanRequest';
			}
			if (vm.caseButtonType === caseButtonTypes.ClearCase) {
				vm.query = 'ClearCaseQuestion';
			}
			if (vm.caseButtonType === caseButtonTypes.ClearOnImage) {
				vm.query = 'ClearCase';
			}
			if (vm.caseButtonType === caseButtonTypes.SuspectOnImage) {
				vm.query = 'SuspectCaseId';
            }
            if (vm.caseButtonType === caseButtonTypes.ScanCaseInDC) {
                vm.query = 'ScanAllSelectedCasesText';
            }
            if (vm.caseButtonType === caseButtonTypes.AwaitingInspectionCaseInDC) {
                vm.query = 'InspectAllSelectedCasesText';
            }
            if (vm.caseButtonType === caseButtonTypes.ClearCaseInDC) {
                vm.query = 'ClearAllSelectedCasesText';
			}
			if (vm.caseButtonType === caseButtonTypes.AwaitingScreeningInDC) {
				vm.query = 'AwaitingScreeningSelectedCasesText';
			}
			if (vm.caseButtonType === caseButtonTypes.SuspectInDC) {
				vm.query = 'SuspectAllSelectedCasesText';
			}
			if (vm.caseButtonType === caseButtonTypes.ReScanInDc) {
				vm.query = 'RescanAllSelectedCasesText';
			}
		};

		vm.conditionalPopUpDisplay = (buttonType) => {
			switch (buttonType) {
				case caseButtonTypes.CancelCase:
					vm.modalCancelReason.show();
					break;
				case caseButtonTypes.Clear:
				case caseButtonTypes.Scan:
					vm.modalPrompt.show();
					break;
				case caseButtonTypes.CancelAllSelected:
				case caseButtonTypes.ClearAllSelected:
				case caseButtonTypes.ScanAllSelected:
				case caseButtonTypes.DeleteAllSelected:
					vm.modalCaseAlert.show();
					break;
				case caseButtonTypes.Inspect:
				case caseButtonTypes.Suspect:
				case caseButtonTypes.ReScanRequest:
				case caseButtonTypes.ClearCase:
				case caseButtonTypes.ReScanCase:
					vm.modalCaseAction.show();
					break;
				case caseButtonTypes.ClearOnImage:
					vm.modalCaseImagePopup.show();
					vm.modalCaseImagePopup.customContainerCSS = 'modal-generic modal-success';
					vm.modalCaseImagePopup.customCSS = 'modal-success-header';
					break;
				case caseButtonTypes.SuspectOnImage:
					vm.modalCaseImagePopup.customContainerCSS = 'modal-generic modal-error';
					vm.modalCaseImagePopup.customCSS = 'modal-error-header';
					vm.modalCaseImagePopup.show();
                    break;
                case caseButtonTypes.ScanCaseInDC:
                case caseButtonTypes.AwaitingInspectionCaseInDC:
				case caseButtonTypes.ClearCaseInDC:
				case caseButtonTypes.AwaitingScreeningInDC:
				case caseButtonTypes.SuspectInDC:
				case caseButtonTypes.ReScanInDc:
				if(buttonType === caseButtonTypes.ClearCaseInDC)
					{
						vm.modalCaseDecisionCentrePopup.customContainerCSS = 'modal-generic modal-success';
						vm.modalCaseDecisionCentrePopup.customCSS = 'modal-success-header';
					}
					else if (buttonType === caseButtonTypes.ScanCaseInDC){
						vm.modalCaseDecisionCentrePopup.customContainerCSS = 'modal-generic modal-warning';
						vm.modalCaseDecisionCentrePopup.customCSS = 'modal-warning-header';
					}
					else if (buttonType === caseButtonTypes.AwaitingInspectionCaseInDC){
						vm.modalCaseDecisionCentrePopup.customContainerCSS = 'modal-generic';
						vm.modalCaseDecisionCentrePopup.customCSS = '';
					}
					else if(buttonType === caseButtonTypes.SuspectInDC)
					{
						vm.modalCaseDecisionCentrePopup.customContainerCSS = 'modal-generic modal-error';
						vm.modalCaseDecisionCentrePopup.customCSS = 'modal-error-header';
					}
					vm.modalCaseDecisionCentrePopup.show();
					break;
				case caseButtonTypes.DecideLater:
					return;

			}
		};

		vm.modalCaseImagePopupClick = (response: ICustomMessageResponse<string>) => {
			vm.globalResponseHolder = response;
			if (!response.result != undefined && response.status === messageResponseType.No) {
				vm.modalCaseImagePopup.hide();
			}
			if (response.status === messageResponseType.Yes && response.result != undefined) {
				this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: true, type: spinnerType.small };
				vm.sendData({});
				vm.modalCaseImagePopup.hide();
			}
		};

		vm.modalCaseDecisionCentrePopupClick = (response: ICustomMessageResponse<string>) => {
			vm.globalResponseHolder = response;
			if (response.status === messageResponseType.Yes) {
				vm.sendData({});
				vm.modalCaseDecisionCentrePopup.hide();
			}
		};

		vm.modalCaseAlertClick = (responseType: messageResponseType) => {

			if ((responseType === messageResponseType.Yes) && (vm.caseButtonType === caseButtonTypes.CancelAllSelected)) {
				vm.modalCancelReason.show();
			}
			else if (responseType === messageResponseType.Yes) {
				vm.sendData({});

			}
			vm.callBackParent.emit(responseType);
			vm.modalCaseAlert.hide();

		};

		vm.modalCancelReasonClick = (response) => {

			let flag: messageResponseType = response.status;
			if (flag === messageResponseType.Yes) {
				vm.sendData(response);
			}
			vm.modalCancelReason.hide();
			vm.callBackParent.emit(response);
		};

		vm.modalPromptClick = (response) => {
			if (response.status === messageResponseType.Yes) {
				vm.sendData({});
			}
			vm.modalPrompt.hide();
			vm.callBackParent.emit(response);
		};
		vm.modalCasePromptClick = (response) => {
			if (response.status === messageResponseType.Yes) {
				vm.sendData({});
			}
			vm.modalCaseAction.hide();
			vm.callBackParent.emit(response);
		};


		vm.sendData = (response) => {
			this.loaderMessage.showLoader = true;
			this.messageService.LoaderMessage = this.loaderMessage;
			vm.payLoad.cases = vm.caseIds.map((id) => {
				return { 'caseId': id, 'caseAction': null, 'assignedTo': null };
			});
			vm.payLoad.status = vm.statusCodeSetter(vm.caseButtonType);
			//let headerMsg = this.translateService.instant(vm.buttontitle);
			if(vm.buttonid==='Inspect' || vm.buttonid==='Suspect' || vm.buttonid==='RescanRequest' || vm.buttonid==='ClearCase'){
				this.loaderMessage.type  = spinnerType.small;
			}else{
				this.loaderMessage.type  = spinnerType.small;
			}
			var headerMsg = this.translateService.instant(vm.buttontitle).split(/[ ,]+/);
			//console.log(headerMsg[0]);
      		this.loaderMessage.headerMessage = (headerMsg[0]!=='Clear') ? headerMsg[0]: '' + ' Case: ' + vm.payLoad.cases[0].caseId;
			this.loaderMessage.footerMessage = this.translateService.instant(vm.buttontitle)+' in progress';
			if (vm.payLoad.status === CaseButtonStatusCode.Inspect) {
				vm.payLoad.reason = reasonType.ActionReason;
				vm.payLoad.cases[0].caseAction = caseActions.noSelection;
			}
			if (vm.caseButtonType === caseButtonTypes.DeleteAllSelected) {
				vm.payLoad.reason = reasonType.DraftReason;
			}

			if ((vm.caseButtonType === caseButtonTypes.CancelAllSelected) || (vm.caseButtonType === caseButtonTypes.CancelCase)) {
				vm.payLoad.reason = response.selectedReason;
				vm.payLoad.status = (response.selectedReason === reasonType.Error) ? caseStatus.Deleted : caseStatus.Cancelled;
			}

			if ((vm.caseButtonType === caseButtonTypes.ClearOnImage) || (vm.caseButtonType === caseButtonTypes.SuspectOnImage)) {
				vm.payLoad.reason = reasonType.StatusChange;
				vm.payLoad.notes = null;
			}

			vm.payLoad.notes = response.notes ? response.notes : null;
			caseService.updateCases(vm.payLoad).subscribe((result) => {
				if (result.status === responseStatus.APIError && result.messageKey === 'SACM30004') {
					this.messageCode = result.message;
					this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: false, type:  spinnerType.small};
					this.modalDuplicateActionPopUp.show();
					return;
				}
				if (result.status === responseStatus.Success) {
					//this.loaderMessage.type  = spinnerType.fullScreen;
					switch (vm.caseButtonType) {
						case caseButtonTypes.ClearOnImage:
						case caseButtonTypes.SuspectOnImage:
						case caseButtonTypes.ScanCaseInDC:
						case caseButtonTypes.AwaitingInspectionCaseInDC:
						case caseButtonTypes.ClearCaseInDC:
						case caseButtonTypes.AwaitingScreeningInDC:
						case caseButtonTypes.SuspectInDC:
						case caseButtonTypes.ReScanInDc:
							vm.callBackParent.emit(vm.globalResponseHolder);

							if(vm.caseButtonType !== caseButtonTypes.ClearOnImage && vm.caseButtonType !== caseButtonTypes.SuspectOnImage)
							{
								if(result.data && result.data.length > 0)
								{
								    vm.failureCaseList = [];
									for (var i = 0; i < result.data.length; i++) {
										vm.failureCaseList.push(result.data[i].caseId);
									}
									vm.query = 'FailedCaseListText';
									vm.pageTitle = 'Cases';
									vm.modalFailureCaseDecisionCentrePopup.show();
								}
							}

							break;
						default:
							break;
					}
					//this.loaderMessage.showLoader = false;
					//this.messageService.LoaderMessage = this.loaderMessage;
					vm.broadcastService.broadcast(broadcastKeys[broadcastKeys.refreshCaseList], null);
				} else {
					//this.loaderMessage.showLoader = false;
					//this.messageService.LoaderMessage = this.loaderMessage;
					vm.broadcastService.broadcast(broadcastKeys[broadcastKeys.errorcaseListUpdate], result);
				}

			},(error: IResponse<any>) => {
					vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
					this.loaderMessage.showLoader = false;
					this.messageService.LoaderMessage = this.loaderMessage;
					vm.failureCaseList = [];
					for (var i = 0; i < vm.payLoad.cases.length; i++) {
						vm.failureCaseList.push(vm.payLoad.cases[i].caseId);
					}
					vm.query = 'FailedCaseListText';
					vm.pageTitle = 'Cases';
					vm.modalFailureCaseDecisionCentrePopup.show();
				}
			);

		};



	}

	ngOnInit(): void {
		this.globalResponseHolder = {};
	}

}
