import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArrivalsComponent } from './arrivals.component';

const routes: Routes = [
    {
        path: '',
        component: ArrivalsComponent
    }
];

export const ArrivalsRouting: ModuleWithProviders = RouterModule.forChild(routes);
