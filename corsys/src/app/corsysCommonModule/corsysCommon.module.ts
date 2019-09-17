import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslatePipe } from '../pipes/translatePipe';
import { DateFormatPipe } from '../pipes/date.format.pipe';
import { TimeFormatPipe } from '../pipes/time.format.pipe';
import { RiskValueFormat } from '../pipes/riskvalue.format.pipe';
import { RiskColorFormat } from '../pipes/riskColor.format.pipe';
import { FilterListContentPipe } from '../pipes/filterContentPipe';
import { FilterRoleListContentPipe } from '../pipes/filterRoleContentPipe';
import { FilterAppListContentPipe } from '../pipes/filterAppContentPipe';
import { TypeFormatPipe } from '../pipes/typeFormat.pipe';
import { SpTextComponent } from '../controls/text.control';
import { SpMultiTextComponent } from '../controls/multitext.control';
import { SpDropdownComponent } from '../controls/dropdown.control';
import { CaseDetailCustomPipe } from '../pipes/caseDetail.custom.pipe';
import { InputSwitchComponent } from '../controls/inputSwitch.control';
import { DashboardSwitchComponent} from '../controls/dashboard.switch.control';
import { DateTimeFormatPipe } from '../pipes/date-time.format.pipe';
import { NumberOnlyDirective } from '../directives/number.directive';
import { SpApplicationsComponent } from '../controls/application.control';
import { Sp3LoaderComponent } from '../components/loader/loader.component';
import { SpAutocompleteComponent } from '../controls/autocomplete.control';
import { CollapsiblePanelComponent } from '../controls/collapsible.panel.control';
import { GridColumnDirective } from '../directives/grid.column.directive';
import { GridControlComponent } from '../controls/grid.control';
import { ModalTimeoutComponent } from '../components/modal/modal.session.timeout.component';
import { ModalPromptComponent } from '../components/modal/modal.prompt.component';
import { SpDateRangeComponent } from '../controls/dateRange.control';
import { NgTranscludeDirective } from '../directives/transclude.directive';
import { MenuItemDirective } from '../directives/menuItem.directive';
import { SideMenuComponent } from '../controls/sidemenu.control';
import { TabHeadingDirective } from '../directives/tab.heading.directive';
import { TabDirective } from '../directives/tab.directive';
import { SP3DatePickerComponent } from '../controls/datepicker.control';
import { TabsetComponent } from '../controls/tabset.control';
import { ModalLoaderComponent } from '../components/modal/modal.loader.component';
import { SpTextboxComponent } from '../controls/textbox.control';
import { SpMultiTextboxComponent } from '../controls/multi.text.control';
import { SpSelectComponent } from '../controls/select.control';
import { SpMessageDisplayComponent } from '../controls/message.control';
import { ModalConfirmComponent } from '../components/modal/modal.confirm.component';
import { ModalLeaveMessageComponent } from '../components/modal/modal.leave.message.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule, ButtonModule, PaginatorModule, DataTableModule, AutoCompleteModule, MultiSelectModule, DropdownModule, SliderModule, SplitButtonModule, PanelModule } from 'primeng/primeng';
import { MyDateRangePickerModule } from '@corsys/daterangepicker';
import { DpDatePickerModule } from 'ng2-date-picker';
import { AppParams } from '../config/config';
import { StorageService } from '../services/storage.service';
import { SortService } from '../services/sort.service';
import { TimeFormatService } from '../services/time.format.service';
import { ModalCaseDetailComponent } from '../components/decisionCenter/decisionCenter.case.detail.component';
import { ModalDuplicateActionComponent } from '../components/modal/modal.duplicateAction.component';
import { ModalQueryBuilderComponent } from '../components/modal/modal.queryBuilder.component';
import { SPButtonComponent } from '../controls/case.button.control';
import { CaseDetailComponent } from '../components/case/case.detail.component';
import { CaseTimeLineComponent } from '../components/modal/modal.case.timeline.component';
import { SPAttachmentUploadComponent } from '../controls/attachment.upload.control';
import { ModalAttachcmentInputComponent } from '../components/modal/modal.attachmentdetails.component';
import { LoadScanImageComponent } from '../components/scannerapp/loadScanImage.component';
import { SpCaseListScannerComponent } from '../components/modal/modal.case.list.scanner';
import { ModalCaseDecisionCentreActionComponent } from '../components/modal/modal.case.decisioncentre.action.component';
import { ModalErrorComponent } from '../components/modal/modal.error.page.component';
import { SP3SliderComponent } from '../controls/slider.control';
import { SpPDropDownComponent } from '../controls/pdropdown.control';
import { SplitButtonComponent } from '../controls/split.button.control';
import { ModalClearCasePopupComponent } from '../components/modal/modal.clearcase.component';
import { ModalVerdictPromptComponent } from '../components/modal/modal.verdict.prompt.component';
import { InspectCaseVerdictComponent } from '../components/inspect/inspect.case.verdict.component';
import { ModalCaseAlertComponent } from '../components/modal/modal.case.alert.component';
import { SpFindingDetailComponent } from '../controls/finding.detail.control';
// import { SP3EffectsComponent } from '../controls/effects.control';
// import { Sp3RulerControlComponent } from '../controls/ruler.control';


@NgModule({
    // directives, components, and pipes
    declarations: [
        TranslatePipe,
        DateFormatPipe,
        TimeFormatPipe,
        RiskValueFormat,
        RiskColorFormat,
        FilterListContentPipe,
        FilterRoleListContentPipe,
        FilterAppListContentPipe,
        TypeFormatPipe,
        SpTextComponent,
        SpDropdownComponent,
        SpMultiTextComponent,
        SpTextboxComponent,
        SpMultiTextboxComponent,
        SpSelectComponent,
        SpMessageDisplayComponent,
        ModalLoaderComponent,
        ModalConfirmComponent,
        ModalLeaveMessageComponent,
        SP3DatePickerComponent,
        TabsetComponent,
        TabDirective,
        TabHeadingDirective,
        SideMenuComponent,
        MenuItemDirective,
        NgTranscludeDirective,
        SpDateRangeComponent,
        ModalPromptComponent,
        ModalTimeoutComponent,
        GridControlComponent,
        GridColumnDirective,
        CollapsiblePanelComponent,
        SpAutocompleteComponent,
        Sp3LoaderComponent,
        SpApplicationsComponent,
        NumberOnlyDirective,
        DateTimeFormatPipe,
        InputSwitchComponent,
        DashboardSwitchComponent,
        CaseDetailCustomPipe,
        ModalCaseDetailComponent,
        ModalDuplicateActionComponent,
        ModalQueryBuilderComponent,
        SPButtonComponent,
        CaseDetailComponent,
        CaseTimeLineComponent,
        SPAttachmentUploadComponent,
        ModalAttachcmentInputComponent,
        LoadScanImageComponent,
        SpCaseListScannerComponent,
        ModalCaseDecisionCentreActionComponent,
        ModalErrorComponent,
        SP3SliderComponent,
        SpPDropDownComponent,
        SplitButtonComponent,
        ModalClearCasePopupComponent,
        ModalVerdictPromptComponent,
        InspectCaseVerdictComponent,
        ModalCaseAlertComponent,
        SpFindingDetailComponent
        // SP3EffectsComponent,
        // Sp3RulerControlComponent
    ],
    // modules
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        PaginatorModule,
        DataTableModule,
        AutoCompleteModule,
        MyDateRangePickerModule,
        MultiSelectModule,
        DpDatePickerModule,
        DropdownModule,
        SliderModule,
        PanelModule,
        SplitButtonModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
        { provide: 'IAppParams', useClass: AppParams },
        { provide: 'IStorageService', useClass: StorageService },
        { provide: 'ITimeFormatService', useClass: TimeFormatService },
        { provide: 'ISortService', useClass: SortService }
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        PaginatorModule,
        DataTableModule,
        AutoCompleteModule,
        MyDateRangePickerModule,
        MultiSelectModule,
        DpDatePickerModule,
        DropdownModule,
        SliderModule,
        PanelModule,
        SplitButtonModule,
        TranslatePipe,
        FilterListContentPipe,
        FilterAppListContentPipe,
        FilterRoleListContentPipe,
        DateFormatPipe,
        TimeFormatPipe,
        RiskValueFormat,
        RiskColorFormat,
        SpTextComponent,
        SpDropdownComponent,
        SpMultiTextComponent,
        SpTextboxComponent,
        SpMultiTextboxComponent,
        SpSelectComponent,
        SpMessageDisplayComponent,
        ModalLoaderComponent,
        ModalTimeoutComponent,
        ModalConfirmComponent,
        ModalLeaveMessageComponent,
        SP3DatePickerComponent,
        TabsetComponent,
        TabDirective,
        TabHeadingDirective,
        SideMenuComponent,
        MenuItemDirective,
        NgTranscludeDirective,
        SpDateRangeComponent,
        ModalPromptComponent,
        GridControlComponent,
        GridColumnDirective,
        CollapsiblePanelComponent,
        SpAutocompleteComponent,
        Sp3LoaderComponent,
        SpApplicationsComponent,
        NumberOnlyDirective,
        DateTimeFormatPipe,
        InputSwitchComponent,
        DashboardSwitchComponent,
        TypeFormatPipe,
        CaseDetailCustomPipe,
        ModalCaseDetailComponent,
        ModalDuplicateActionComponent,
        ModalQueryBuilderComponent,
        SPButtonComponent,
        CaseDetailComponent,
        CaseTimeLineComponent,
        SPAttachmentUploadComponent,
        ModalAttachcmentInputComponent,
        LoadScanImageComponent,
        SpCaseListScannerComponent,
        ModalCaseDecisionCentreActionComponent,
        ModalErrorComponent,
        SP3SliderComponent,
        SpPDropDownComponent,
        SplitButtonComponent,
        ModalClearCasePopupComponent,
        ModalVerdictPromptComponent,
        InspectCaseVerdictComponent,
        ModalCaseAlertComponent,
        SpFindingDetailComponent
        // SP3EffectsComponent,
        // Sp3RulerControlComponent
    ]
})

export class CorsysCommonModule { }
