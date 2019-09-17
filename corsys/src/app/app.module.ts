import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { rootRouterConfig } from './app.routing';
import { AppComponent } from './components/app.component';
import { HeaderComponent } from './components/header/header.component';
import { TRANSLATION_PROVIDERS } from './config/translations';
import { AnalyzerService } from './services/analyzer.service';
import { ApplicationsService } from './services/application.service';
import { AttachmentService } from './services/attachment.service';
import { CaseService } from './services/case.service';
import { CaseAnalysisService } from './services/caseanalysis.service';
import { CommonService } from './services/common.service';
import { GeneralSettingsService } from './services/general.settings.service';
import { ImageReaderService } from './services/image.reader.service';
import { ImageService } from './services/image.service';
import { MessageService } from './services/message.service';
import { TranslateService } from './services/translate.service';
import { UserService } from './services/user.service';
import { ProfilerSettingService } from './services/profilerSettings.service';
import { RAPPathwayService } from './services/rapPathway.service';
import { ScannerService } from './services/scanner.service';
import { DateTimeFormatService } from './services/data-time.format.service';
import { ModalSuccessComponent } from './components/modal/modal.success.component';
import { Adal4Service } from '@corsys/corsys-adal';
import { DateFormatService } from './services/date.format.service';
import { AuthGuard } from './auth.guard';
import { UnAuthorizedComponent } from './components/unauthorized/unauthorized.component';
import { SecureService } from './services/secure.adal.service';
import { InspectCaseService } from './services/inspect.service';
import { UserIdleModule } from './shared/user-idle.module';
import { CorsysCommonModule } from './corsysCommonModule/corsysCommon.module';
import { CacheStorageService } from './services/cache.storage.service';
import { AuditService} from './services/audit.service';
import { BroadcastService } from './services/broadcast.service';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ModalSuccessComponent,
    UnAuthorizedComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    CorsysCommonModule,
    RouterModule.forRoot(rootRouterConfig),
    UserIdleModule.forRoot({idle: 900, timeout: 2, ping: 1})
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  providers: [
    TRANSLATION_PROVIDERS,
    Adal4Service,
    SecureService,
    AuthGuard,
    { provide: 'ITranslateService', useClass: TranslateService },
    { provide: 'ICaseService', useClass: CaseService },
    { provide: 'IMessageService', useClass: MessageService },
    { provide: 'IUserService', useClass: UserService },
    { provide: 'ICommonService', useClass: CommonService },
    { provide: 'ICacheStorageService', useClass: CacheStorageService },
    { provide: 'IAuditMessageService', useClass: AuditService },
    { provide: 'IDateFormatService', useClass: DateFormatService },
    { provide: 'IAttachmentService', useClass: AttachmentService },
    { provide: 'IAnalyzerService', useClass: AnalyzerService },
    { provide: 'IImageReaderService', useClass: ImageReaderService },
    { provide: 'IImageService', useClass: ImageService },
    { provide: 'ICaseAnalysisService', useClass: CaseAnalysisService },
    { provide: 'IApplicationService', useClass: ApplicationsService },
    { provide: 'IGeneralSettings', useClass: GeneralSettingsService },
    { provide: 'InspectCaseService', useClass: InspectCaseService },
    { provide: 'IProfilerSettingService', useClass: ProfilerSettingService },
    { provide: 'IRAPPathwayService', useClass: RAPPathwayService },
    { provide: 'IDateTimeFormatService', useClass: DateTimeFormatService },
    { provide: 'IScannerService', useClass: ScannerService },
    { provide: 'IBroadcastService', useClass: BroadcastService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
