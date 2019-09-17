import { Routes } from '@angular/router';
import { UnAuthorizedComponent } from './components/unauthorized/unauthorized.component';
import { ENV_APP_MAP } from './config/appMap/appMap';
import { AuthGuard } from './auth.guard';

export const rootRouterConfig: Routes = [
	{ path: ENV_APP_MAP.landing, loadChildren: 'app/components/landing/landing.module#LandingModule' },
	{ path: ENV_APP_MAP.analyzer, loadChildren: 'app/components/analyzer/analyzer.module#AnalyzerModule', canActivate: [AuthGuard]},
	{ path: ENV_APP_MAP.arrivals, loadChildren: 'app/components/arrivals/arrivals.module#ArrivalsModule', canActivate: [AuthGuard] },
	{ path: ENV_APP_MAP.decisionCenter, loadChildren: 'app/components/decisionCenter/decisionCenter.module#DecisionCenterModule', canActivate: [ AuthGuard ]},
	{ path: ENV_APP_MAP.inspection, loadChildren: 'app/components/inspect/inspect.module#InspectModule', canActivate: [AuthGuard] },
	{ path: ENV_APP_MAP.scanner, loadChildren: 'app/components/scannerapp/scannerapp.module#ScannerAppModule', canActivate: [AuthGuard] },
	{ path: ENV_APP_MAP.settings, loadChildren: 'app/components/settings/settings.module#SettingsModule', canActivate: [AuthGuard] },
	{ path: ENV_APP_MAP.dashboard, loadChildren: 'app/components/dashboard/dashboard.module#DashboardModule', canActivate: [AuthGuard] },
	{ path: ENV_APP_MAP.unauthorized, component: UnAuthorizedComponent },

	// do not change the order of the below routes
	{ path: '', redirectTo: '/landing', pathMatch: 'full' },
	{ path: '**', component: UnAuthorizedComponent }
];
