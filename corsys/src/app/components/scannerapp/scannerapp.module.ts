import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CorsysCommonModule } from '../../corsysCommonModule/corsysCommon.module';
import { CommonModule } from '@angular/common';
import { ScannerAppRouting } from './scannerapp.routing';
import { ScannerComponent } from './scannerapp.component';
//import { LoadScanImageComponent } from './loadScanImage.component';
//import { SpCaseListScannerComponent } from '../modal/modal.case.list.scanner';

@NgModule({
    // directives, components, and pipes
    declarations: [
        ScannerComponent,
        //SpCaseListScannerComponent,        
    ],
    imports: [
        ScannerAppRouting,
        CorsysCommonModule,
        CommonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ScannerAppModule {
}
