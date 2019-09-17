import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';

const routes: Routes = [
    {
        path: '',
        component: LandingComponent
    }
];

export const LandingRoutingProviders: any[] = [];
export const LandingRouting: ModuleWithProviders = RouterModule.forChild(routes);
