import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecisionCenterRoutes } from './decisionCenterRouter';
import { DecisionCenterComponent } from './decisionCenter.component';
import { CorsysCommonModule } from '../../corsysCommonModule/corsysCommon.module';
import { ControlCenterCaseViewComponent } from './decisionCenter.case.view.component';
import { ControlCenterCaseManageComponent } from './decisionCenter.case.manage.component';
import { DecisionCentreScreeningCaseViewComponent } from './decisionCenter.screening.case.view.component';
import { DecisioncentreClearedCaseComponent } from './decisionCenter.cleared.component';

@NgModule({
  declarations: [ DecisionCenterComponent, ControlCenterCaseViewComponent, ControlCenterCaseManageComponent, DecisionCentreScreeningCaseViewComponent, DecisioncentreClearedCaseComponent ],
  imports: [ CommonModule, DecisionCenterRoutes, CorsysCommonModule ]
})

export class DecisionCenterModule {}


