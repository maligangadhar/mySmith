import {Component,ViewChild,Inject,Output} from '@angular/core';
import {IBroadcastService} from '../../interfaces/interfaces';
import {broadcastKeys, applicationName, verdictSources} from '../../models/enums';
import { ModalConfirmComponent} from '../modal/modal.confirm.component';
@Component({
    selector: 'sp3-comp-inspect-case-detail',
    templateUrl: './inspect.case.detail.component.html'
})
export class Sp3ModalInspectCaseDetailComponent {
    @Output() cardDisplayUpdate;
    @ViewChild('modalClose') modalClose: ModalConfirmComponent;
    caseId: string;
    isFooterVisible: boolean = false;
    appName: applicationName = applicationName.Inspection;
    visible: boolean = false;
    source: verdictSources = verdictSources.Inspection;
    public visibleAnimate = false;

    constructor(@Inject('IBroadcastService') private broadcastService: IBroadcastService) {

    }
    public show(caseId: string, isFooterVisible: boolean = false): void {
        this.visible = true;
        //this.reset();
        setTimeout(() => this.visibleAnimate = true);
        this.caseId = caseId;
        this.isFooterVisible = isFooterVisible;       
    }

    hide(flagModified: boolean): void {
        //this.reset();
        this.visibleAnimate = false;
        if (flagModified === true) {
            //this.flagModified = true;
            this.broadcastService.broadcast(broadcastKeys[broadcastKeys.refreshCaseList], null);
        }
        setTimeout(() => this.visible = false, 1);
    }
}
