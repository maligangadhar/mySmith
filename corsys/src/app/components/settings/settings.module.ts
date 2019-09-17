import { NgModule } from '@angular/core';
import { GeneralSettingComponent } from '../general/general.setting.component';
import { ViewRoleComponent } from '../role/role.view.component';
import { RoleDetailComponent } from '../role/role.detail.component';
import { ModalCreateRoleComponent } from '../modal/modal.role.create.component';
import { SpRolesComponent } from '../../controls/role.control';
import { SettingsComponent } from './settings.component';
import { CardLayoutControlComponent } from '../../controls/card.layout.control';
import { ModalCreateUserComponent } from '../modal/modal.user.create.component';
import { UserDetailComponent } from '../user/user.detail.component';
import { UserViewComponent } from '../user/user.view.component';
import { UserHeaderComponent } from '../user/user.header.component';
import { RoleHeaderComponent } from '../role/role.header.component';
import { ApplicationDetailComponent } from '../application/application.detail.component';
import { ApplicationHeaderComponent } from '../application/application.header.component';
import { ApplicationViewComponent } from '../application/application.view.component';
import { ApplicationRoleComponent } from '../application/application.role.component';
import { ProfilerSettingComponent } from '../profiler/profiler.settings.component';
import { RapPathwayComponent } from '../rap/rap.pathway.component';
import { DCSettingComponent } from '../decisionCenterSettings/dc.settings.component';
import { UsersettingsComponent } from '../user/usersettings/usersettings.component';
import { RoleSettingsComponent } from '../role/rolesettings.component';
import { ApplicationsettingsComponent } from '../application/applicationsettings.component';
import { DeviceLicenseComponent } from '../deviceLicense/device.license.component';
import { locationComponent } from '../location/locationslist.component';
import { OperationalDashboardSettingComponent } from '../operationalDashboardSetting/operationalDashboard.component';
import { SettingsRouting } from './settings.routing';
import { RoleService } from '../../services/role.service';
import { DeviceLicenseService } from '../../services/deviceLicense.service';
import { LocationService } from '../../services/location.service';
import { OperationDashboardSettingService } from '../../services/operationalDashboard.service';
import { CommonModule } from '@angular/common';
import { CorsysCommonModule } from '../../corsysCommonModule/corsysCommon.module';


@NgModule({
    // directives, components, and pipes
    declarations: [
        GeneralSettingComponent,
        ViewRoleComponent,
        RoleDetailComponent,
        ModalCreateRoleComponent,
        SpRolesComponent,
        SettingsComponent,
        CardLayoutControlComponent,
        ModalCreateUserComponent,
        UserDetailComponent,
        UserViewComponent,
        UserHeaderComponent,
        RoleHeaderComponent,
        ApplicationDetailComponent,
        ApplicationHeaderComponent,
        ApplicationViewComponent,
        ApplicationRoleComponent,
        ProfilerSettingComponent,
        RapPathwayComponent,
        DCSettingComponent,
        UsersettingsComponent,
        RoleSettingsComponent,
        ApplicationsettingsComponent,
        DeviceLicenseComponent,
        locationComponent,
        OperationalDashboardSettingComponent
    ],

    imports: [
        SettingsRouting,
         CorsysCommonModule,
        CommonModule
    ],
    providers: [
        { provide: 'IRoleService', useClass: RoleService },
        { provide: 'IDeviceLicenseService', useClass: DeviceLicenseService },
        { provide: 'ILocationService', useClass: LocationService },
        { provide: 'IOperationDashboardSettingService', useClass: OperationDashboardSettingService }
    ]
})
export class SettingsModule {
}
