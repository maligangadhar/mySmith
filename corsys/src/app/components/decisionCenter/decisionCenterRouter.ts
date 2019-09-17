import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DecisionCenterComponent } from './decisionCenter.component';
// import { RouterModule } from '@angular/router/src/router_module';

const routes: Routes = [
    { path: '', component: DecisionCenterComponent }
];

export const DecisionCenterRoutes: ModuleWithProviders = RouterModule.forChild(routes);


/* import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
    {
        path: '',
        component: SettingsComponent
    }
];

export const SettingsRoutingProviders: any[] = [];
export const SettingsRouting: ModuleWithProviders = RouterModule.forChild(routes);
 */
