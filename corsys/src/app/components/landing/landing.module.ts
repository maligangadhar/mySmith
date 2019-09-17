import { NgModule } from '@angular/core';
import { CorsysCommonModule } from '../../corsysCommonModule/corsysCommon.module';
import { CommonModule } from '@angular/common';
import { LandingRouting } from './landing.routing';
import { LandingComponent } from './landing.component';

@NgModule({
    // directives, components, and pipes
    declarations: [
        LandingComponent
    ],
    imports: [
        LandingRouting,
        CorsysCommonModule,
        CommonModule
    ],
    providers: [

    ]
})
export class LandingModule {
}
