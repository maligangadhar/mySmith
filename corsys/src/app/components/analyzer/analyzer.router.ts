import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnalyzerComponent } from './analyzer.component';


const routes: Routes = [
    { path: '', component: AnalyzerComponent }
];

export const AnalyzerRouting: ModuleWithProviders = RouterModule.forChild(routes);
