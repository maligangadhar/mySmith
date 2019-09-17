import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorsysCommonModule } from '../../corsysCommonModule/corsysCommon.module';
import { DashboardRouting } from './dashboard.router';
import { ProfilerResultVerdictComponent } from './profiler/profilerresult/profilerresult-verdict.component';
import { ProfilerresultVerdictDailyComponent } from './profiler/profilerresult/profilerresult-verdict-daily.component';
import { ProfilerresultScreeningComponent } from './profiler/profilerresult/profilerresult-screening.component';
import { ProfilerresultScreeningDailyComponent } from './profiler/profilerresult/profilerresult-screening-daily.component';
import { ProfilerResultComponent } from './profiler/profilerresult/profilerresult.component';
import { ProfilerDashBoardComponent } from './profiler/profiler-dashboard.component';
import { DashboardHomeComponent } from './dashboard-home.component';
import { OperationalComponent } from './operational/operational.component';
import { GaugeComponent } from '../../controls/gauge.component';
import { HistogramComponent } from '../../controls/histogram.component';
import { TimeSeriesComponent } from '../../controls/timeseries.component';
import { LineChartComponent } from '../../controls/lineChart.component';
import { OperationChartService } from '../../services/operationalChartService';
import { ProfilerDashBoardService } from '../../services/profiler-dashboard.service';
@NgModule({
    declarations: [ OperationalComponent, 
        DashboardHomeComponent, 
        ProfilerDashBoardComponent, 
        ProfilerResultVerdictComponent,
        ProfilerResultComponent,
        ProfilerresultScreeningDailyComponent,
        ProfilerresultScreeningComponent,
        ProfilerresultVerdictDailyComponent,
        ProfilerResultVerdictComponent,
        GaugeComponent, HistogramComponent, TimeSeriesComponent, LineChartComponent
    ],
    imports: [ CommonModule, CorsysCommonModule, DashboardRouting ],
    providers: [ 
        { provide: 'IOperationalChartService', useClass: OperationChartService },
        { provide: 'IProfilerChartService', useClass: ProfilerDashBoardService}
    ]
})

export class DashboardModule {}
