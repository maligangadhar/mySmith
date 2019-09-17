import { Component, Inject, OnInit } from '@angular/core';
import * as c3 from 'c3';
import moment from 'moment/src/moment';
import { IProfilerChartService, ITranslateService, IAppParams } from '../../../interfaces/interfaces';
import { ILineRegionInput, IResponse, IProfilerLineChart } from '../../../models/viewModels';

@Component({
    selector: 'sp3-comp-profilerdashboard-layout',
    templateUrl: './profiler-dashboard.component.html'
})

export class ProfilerDashBoardComponent implements OnInit {
    constructor(@Inject('IAppParams') private config: IAppParams, 
        @Inject('IProfilerChartService') private profilerChartService: IProfilerChartService,
        @Inject('ITranslateService') public translateService: ITranslateService) { }
    chartData: c3.ChartConfiguration;
    presentDate: string = moment(new Date(), moment.ISO_8601).format();
    nextDate: string = moment(new Date(), moment.ISO_8601).add(6, 'days').format();
    previousDate:string= moment(new Date(), moment.ISO_8601).subtract(30, 'days').format();
    totalChart: any;
    hideLegends: string[] = ['date', 'actual', 'expected'];
    lineChartLoading:boolean=false;
    riskCategory1Loading:boolean=false;
    riskCategory2Loading:boolean=false;

    totalChartRegion: ILineRegionInput = {
        'regions': { 'expected': [{ 'style': 'dashed' }] },
        dynamicRegion: false
    };
    rapChart1Region: ILineRegionInput = {
        'regions': { 'actual': [{ 'style': 'dashed' }] },
        dynamicRegion: false
    };
    rapChart2Region: ILineRegionInput = {
        'regions': { 'actual': [{ 'style': 'dashed' }] },
        dynamicRegion: false
    };

    rapChart1: Object;
    rapChart2: Object;
    getTotalCases = () => {
      this.lineChartLoading=true;
        this.profilerChartService.getData(this.config.getParams().lineChartUrl, { 'filter': 'DateOfArrival^IN^(' + this.presentDate + ',' + this.nextDate + ')^AND^GROUPBY(DateOfArrival)' }).subscribe((result: IResponse<IProfilerLineChart[]>) => {
            let data = result['data'];
            this.lineChartLoading=false;
            this.totalChart = this.profilerChartService.formatData(data, {
                'actual': '#e68f28',
                'expected': '#e68f28'
            }, { 'actual': this.translateService.instant('TotalProfiledCases'), 'expected': this.translateService.instant('TotalExpectedCases') });
        });
    }

    //for Amber
    getRiskCategory1 = () => {
        this.riskCategory1Loading=true;
        this.profilerChartService.getData(this.config.getParams().lineChartUrl, { 'filter': 'RiskRating^IN^(1)^AND^DateOfArrival^IN^(' + this.presentDate + ',' + this.nextDate + ')^AND^GROUPBY(DateOfArrival)' }).subscribe((result: IResponse<IProfilerLineChart[]>) => {
            // tslint:disable-next-line:no-console
            // console.log('result::::', JSON.stringify(result))
            let data = result['data'];
            this.riskCategory1Loading=false;
            this.rapChart1 = this.profilerChartService.formatData(data, {
                'actual': '#ff6347',
                'expected': '#ff6347'
            }, { 'actual': this.translateService.instant('ProfiledCases'), 'expected': this.translateService.instant('ExpectedCase') });
        });
    }

    //for Red
    getRiskCategory2 = () => {
      this.riskCategory2Loading=true;
        this.profilerChartService.getData(this.config.getParams().lineChartUrl, { 'filter': 'RiskRating^IN^(2)^AND^DateOfArrival^IN^(' + this.presentDate + ',' + this.nextDate + ')^AND^GROUPBY(DateOfArrival)' }).subscribe((result: IResponse<IProfilerLineChart[]>) => {
            // tslint:disable-next-line:no-console
            // console.log('result::::', JSON.stringify(result))
            let data = result['data'];
            this.riskCategory2Loading=false;
            this.rapChart2 = this.profilerChartService.formatData(data, {
                'actual': '#f3d13b',
                'expected': '#f3d13b'
            }, { 'actual': this.translateService.instant('ProfiledCases'), 'expected': this.translateService.instant('ExpectedCase') });
        });
    }
   
    ngOnInit(): void {
        this.getTotalCases();
        this.getRiskCategory1();
        this.getRiskCategory2();
    }
}

