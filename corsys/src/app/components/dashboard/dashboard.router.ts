import { Routes, RouterModule } from '@angular/router';
import { DashboardHomeComponent } from './dashboard-home.component';
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';

const routes: Routes = [
    {path: '', component: DashboardHomeComponent }
];

export const DashboardRouting: ModuleWithProviders = RouterModule.forChild(routes);
