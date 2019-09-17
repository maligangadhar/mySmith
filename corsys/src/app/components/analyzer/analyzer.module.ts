import { NgModule } from '@angular/core';
import { AnalyzerComponent } from './analyzer.component';
import { ImageAnalyzerComponent } from './image.analyzer.component';
import { CorsysCommonModule } from '../../corsysCommonModule/corsysCommon.module';
import { CommonModule } from '@angular/common';
import { AnalyzerRouting } from './analyzer.router';
import { Sp3MarkAreaControlComponent } from '../../controls/mark.area.control';
import { Sp3MarkControlComponent } from '../../controls/mark.control';
import { Sp3RulerControlComponent } from '../../controls/ruler.control';
import { SP3EffectsComponent } from '../../controls/effects.control';

@NgModule({
    declarations: [ AnalyzerComponent, ImageAnalyzerComponent, Sp3MarkAreaControlComponent, Sp3MarkControlComponent, Sp3RulerControlComponent, SP3EffectsComponent],
    exports: [],
    imports: [CommonModule, CorsysCommonModule, AnalyzerRouting] 
})

export class AnalyzerModule {
    
}
