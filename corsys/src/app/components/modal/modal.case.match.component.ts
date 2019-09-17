import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICaseMatchInformation } from '../../models/viewModels';

@Component({
    selector: 'sp3-comp-modal-case-match',
    templateUrl: './modal.case.match.component.html'
})

export class ModalCaseMatchComponent  {
    @Input() public questionText: string;   
    @Input() public pageTitle: string;  
    @Input() public caseDetails:any;
    @Input() public to?:string='';
    @Input() public from?:string='';
    @Input() public statusName?:string='';
    @Output() sameCaseButtonStatus = new EventEmitter<boolean>();
    public visible = false;
    public visibleAnimate = false;

    caseInfo : ICaseMatchInformation = null;
    public show(): void {       
        this.visible = true;
        setTimeout(() => this.visibleAnimate = true);
    }

    public hide(): void {
        this.visibleAnimate = false;
        setTimeout(() => this.visible = false, 300);
    }

    differentCaseClick  = () => {
        this.hide();       
        this.sameCaseButtonStatus.emit(false);        
    }

    sameCaseClick = () => {
        this.hide();
        this.sameCaseButtonStatus.emit(true);
    }     

    closeClick = ()=> {
        this.hide();
    }
}
