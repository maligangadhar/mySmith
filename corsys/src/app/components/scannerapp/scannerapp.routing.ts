import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScannerComponent } from './scannerapp.component';

const routes: Routes = [
    {
        path: '',
        component: ScannerComponent
    }
];

export const ScannerAppRoutingProviders: any[] = [];
export const ScannerAppRouting: ModuleWithProviders = RouterModule.forChild(routes);
