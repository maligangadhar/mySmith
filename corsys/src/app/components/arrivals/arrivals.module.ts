import { NgModule } from '@angular/core';
import { ArrivalsRouting } from './arrivals.routing';
import { CorsysCommonModule } from '../../corsysCommonModule/corsysCommon.module';
import { CommonModule } from '@angular/common';
import { ArrivalsComponent } from './arrivals.component';
import { CaseViewComponent } from '../case/case.view.component';
import { ModalCaseCreationComponent } from '../modal/modal.case.creation.component';
import { ModalCaseMatchComponent } from '../modal/modal.case.match.component';
// import { ModalCaseAlertComponent } from '../modal/modal.case.alert.component';
// import { SpFindingDetailComponent } from '../../controls/finding.detail.control';
import { ModalCaseCancelReasonComponent } from '../modal/modal.casecancelreason.component';
import { ModalCasePromptComponent } from '../modal/modal.case.action.prompt.component';

@NgModule({
    // directives, components, and pipes
    declarations: [
        CaseViewComponent,
        ArrivalsComponent,
        ModalCaseCreationComponent,
        // SpFindingDetailComponent,
        ModalCaseCancelReasonComponent,
        ModalCasePromptComponent,
        // ModalCaseAlertComponent,
        ModalCaseMatchComponent,
    ],
    imports: [
        ArrivalsRouting,
        CorsysCommonModule,
        CommonModule
    ],
    providers: [

    ]
})
export class ArrivalsModule {
}
