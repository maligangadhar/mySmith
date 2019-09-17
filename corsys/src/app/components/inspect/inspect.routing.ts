import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InspectComponent } from './inspect.component';

const routes: Routes = [
    {
        path: '',
        component: InspectComponent
    }
];

export const InspectRoutingProviders: any[] = [];
export const InspectRouting: ModuleWithProviders = RouterModule.forChild(routes);
