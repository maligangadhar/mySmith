import {Component,ViewChild,Inject,Output, EventEmitter} from '@angular/core';
import {IBroadcastService} from '../../interfaces/interfaces';
import {broadcastKeys, applicationName, verdictSources} from '../../models/enums';
import { ModalConfirmComponent} from '../modal/modal.confirm.component';
@Component({
    selector: 'sp3-comp-modal-case-detail',
    templateUrl: './decisionCenter.case.detail.component.html'
})
export class ModalCaseDetailComponent {
    @Output() cardDisplayUpdate;
    @ViewChild('modalClose') modalClose: ModalConfirmComponent;
    caseId: string;
    isFooterVisible: boolean = true;
    appName: applicationName = applicationName.ControlCenter;
    visible: boolean = false;
    verdictSource? : verdictSources = null;
    public visibleAnimate = false;
    @Output() public closeAction: EventEmitter<boolean> = new EventEmitter();
    constructor(@Inject('IBroadcastService') private broadcastService: IBroadcastService) {        
    }
    show(caseId: string, isFooterVisible: boolean = true, source?: verdictSources): void {
        this.visible = true;
        //this.reset();
        setTimeout(() => this.visibleAnimate = true);
        this.caseId = caseId;
        this.isFooterVisible = isFooterVisible;   
        if(source)
        {
            this.verdictSource = source;
        }    
    }

    hide(flagModified: boolean): void {
        //this.reset();
        this.visibleAnimate = false;
        if (flagModified === true) {
            //this.flagModified = true;
            this.closeAction.emit();
            this.broadcastService.broadcast(broadcastKeys[broadcastKeys.refreshCaseList], null);
        }
        setTimeout(() => this.visible = false, 1);
    }
}
