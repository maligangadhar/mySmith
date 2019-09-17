import { Component, EventEmitter, Input, Output } from '@angular/core';
import { messageResponseType, caseButtonTypes } from '../../models/enums';
import { IKeyValue, ICustomMessageResponse } from '../../models/viewModels';

@Component({
    selector: 'sp3-comp-modal-case-decisioncentre-action',
    templateUrl: './modal.case.decisioncentre.action.component.html'
})

export class ModalCaseDecisionCentreActionComponent {
    @Input() public questionText: string;
    @Input() public caseList: any;
    @Input() public buttonTitle: string = '';
    @Input() public selectedButtonType: caseButtonTypes;
    @Input() public pageTitle: string;
    @Input() public inspectionTypes: IKeyValue[] = [];
    @Input() public customContainerCSS: string = '';
    @Input() public customCSS: string = '';
    @Output() confirmButtonStat = new EventEmitter<ICustomMessageResponse<string>>();

    public visible = false;
    public visibleAnimate = false;
    isCaseButtonClicked: boolean = true;
    isConfirmDisabled: boolean = false;
    isCommentsRequired: boolean = false;
    caseButtonType: any;
    description: string = '';
    descriptionLengthLimit = 1000;
    selectedInspectionType: IKeyValue = null;

    public show(): void {
        this.resetValues();
        this.visible = true;
        this.visibleAnimate = true;
    }

    public hide(): void {
        this.visibleAnimate = false;
        this.visible = false;
    }

    yesClick = () => {
        this.hide();
        if (this.selectedButtonType === caseButtonTypes.AwaitingInspectionCaseInDC) {
            this.confirmButtonStat.emit({ status: messageResponseType.Yes, result: this.description, selResult: this.selectedInspectionType.id === -1 ? null : this.selectedInspectionType.id });
        }
        else {
            this.confirmButtonStat.emit({ status: messageResponseType.Yes, result: this.description });
        }
    }

    closeClick = () => {
        this.hide();
        this.confirmButtonStat.emit({ status: messageResponseType.No, result: this.description });
    }

    getConfirmDisabled = () => {
        this.isConfirmDisabled = true;
        switch (this.selectedButtonType) {
            case caseButtonTypes.AwaitingInspectionCaseInDC:
                if (this.selectedInspectionType !== null && this.selectedInspectionType.id !== -1) {
                    this.isConfirmDisabled = false;
                }
                break;
            case caseButtonTypes.ScanCaseInDC:
            case caseButtonTypes.ClearCaseInDC:
            case caseButtonTypes.AwaitingScreeningInDC:
            case caseButtonTypes.SuspectInDC:
            case caseButtonTypes.ReScanInDc:
                this.isConfirmDisabled = false;
                break;
        }
        return this.isConfirmDisabled;
    }

    resetValues = () => {
        this.description = '';
        this.pageTitle = this.pageTitle;
        this.caseButtonType = caseButtonTypes;
        this.isCaseButtonClicked = true;
        if (this.inspectionTypes.length > 0) {
            this.selectedInspectionType = this.inspectionTypes[0];
        }
        switch (this.selectedButtonType) {
            case caseButtonTypes.ScanCaseInDC:
            case caseButtonTypes.AwaitingInspectionCaseInDC:
            case caseButtonTypes.ReScanInDc:
                this.isConfirmDisabled = false;
                break;
            case caseButtonTypes.ClearCaseInDC:
            case caseButtonTypes.AwaitingScreeningInDC:
            case caseButtonTypes.SuspectInDC:
                this.isCommentsRequired = false;
                this.isConfirmDisabled = true;
                break;
            default:
                this.isCaseButtonClicked = false;
                break;
        }
    }
}
