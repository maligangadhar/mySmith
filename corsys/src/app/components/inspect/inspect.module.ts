import { NgModule } from '@angular/core';
import { CorsysCommonModule } from '../../corsysCommonModule/corsysCommon.module';
import { CommonModule } from '@angular/common';
import { InspectRouting } from './inspect.routing';
import { InspectComponent } from './inspect.component';
import { Sp3InspectCaseViewComponent } from './inspect.case.view.component';
import { InspectCaseManageComponent } from './inspect.case.manage.component';
import { InspectDetailComponent } from './inspect.detail.component';
import { Sp3ModalInspectCaseDetailComponent } from './inspect.case.detail.component';
import { SpPMultiSelectComponent } from '../../controls/pmultiselect.control';
// import { InspectCaseVerdictComponent } from './inspect.case.verdict.component';
//import { CaseTimeLineComponent } from '../modal/modal.case.timeline.component';
//import { SPAttachmentUploadComponent } from '../../controls/attachment.upload.control';
// import { ModalVerdictPromptComponent } from '../modal/modal.verdict.prompt.component';
//import { ModalAttachcmentInputComponent } from '../modal/modal.attachmentdetails.component';
@NgModule({
    // directives, components, and pipes
    declarations: [
        InspectComponent,
        Sp3InspectCaseViewComponent,
        InspectCaseManageComponent,
        InspectDetailComponent,
        Sp3ModalInspectCaseDetailComponent,
        SpPMultiSelectComponent,
        // InspectCaseVerdictComponent,
        //CaseTimeLineComponent,
        //SPAttachmentUploadComponent,
        // ModalVerdictPromptComponent,
        //ModalAttachcmentInputComponent,
    ],
    imports: [
        InspectRouting,
        CorsysCommonModule,
        CommonModule
    ],
    providers: [

    ]
})
export class InspectModule {
}
