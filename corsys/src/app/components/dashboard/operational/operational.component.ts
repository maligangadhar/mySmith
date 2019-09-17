import * as c3 from 'c3';
import { Component, OnInit, Inject } from '@angular/core';
import * as moment from 'moment';
import { IUserList, IOperationalUserChart, IResponse, IKPIChart, IOperationalineChartStructure, IHistogramChart, ITimeSeriesResponse } from '../../../models/viewModels';
import { IOperationalChartService, ITranslateService } from '../../../interfaces/interfaces';

@Component({
    selector: 'sp3-comp-operational-dashboard',
    templateUrl: './operational.component.html'
})

export class OperationalComponent implements OnInit {
    screenedCKPIData: Object;
    accessedKPIData: Object;
    inspectedKPIData: Object;
    suspectedKPIData: Object;
    clearedKPIData: object;
    lineChart: c3.ChartAPI;
    actual: number = 0;
    target: number = 0;
    footerFlag: boolean = true;
    footerMessage: number = 0;
    totalChart: any;
    fromDate: any;
    fromYesterday:any;
    toDate: any;
    fromDateStart: any;
    selectedUsers: Set<string> = new Set<string>();
    screenKpiLoading: boolean = false;
    selectedFilter: string = 'today';
    userList: IUserList[] = [];
    userQueryString: string = '';
    userGridList: IOperationalUserChart[];
    screenKPIVal: number = 0;
    screenFlag: boolean = false;
    screenChangeVal: number = 0;
    intermediateResult: any;
    // finalResult: Array<any> = [];
    accessedKPIVal: number = 0;
    accessedFlag: boolean = false;
    accessChangeVal: number = 0;

    inspectedKPIVal: number = 0;
    inspectedFlag: boolean = false;
    inspectChangeVal: number = 0;

    suspectedKPIVal: number = 0;
    suspectedFlag: boolean = false;
    suspectChangeVal: number = 0;

    clearedKPIVal: number = 0;
    clearedFlag: boolean = false;
    clearedChangeVal: number = 0;
    totalChartRegion: {};
    column: any[] = [];

    kpiLoading: boolean = false;
    guageChartloading: boolean = false;
    timeSeriesLoading: boolean = false;
    timeSeriesColor: any;
    guageRange: any;

    isDesc: boolean = false;
    columnName: string = 'type';
    direction: number = -1;
    histogramData:any;
    columns: any[] = [];
    constructor( @Inject('IOperationalChartService') public OperationChartService: IOperationalChartService,
    @Inject('ITranslateService') private translateService: ITranslateService) {
        let lang : string = this.translateService.CurrentLang;
        this.fromDate = moment().subtract(2, 'days').locale(lang).format('ddd,  Do MMM, h:mm a');
        this.fromYesterday = moment().subtract(1, 'days').locale(lang).format('ddd, Do MMM , h:mm a');
        this.toDate=moment().locale(lang).format('ddd, Do MMM')+' 00:00 - '+moment().locale(lang).format('h:mm a');
        this.guageRange = moment().subtract(1, 'hour').hour() + ':00' + ' - ' + moment().hours() + ':00';
        this.fromDateStart=moment().subtract(1,'days').startOf('day').locale(lang).format('ddd, Do MMM')+' 00:00 - '+moment().locale(lang).format('h:mm a'); 
    }
    getChartData = (filter) => {
        this.timeSeriesLoading = true;
        this.selectedFilter = filter;
        this.screenKPIVal=0;
        this.accessedKPIVal=0;
        this.inspectedKPIVal=0;
        this.suspectedKPIVal=0;
        this.clearedKPIVal=0;
        this.getKpiData();
        this.getTimeSereiesData(this.userQueryString);
        let lang : string = this.translateService.CurrentLang;
        this.fromDate = moment().subtract(2, 'days').locale(lang).format('ddd,  Do MMM, h:mm a');
        this.fromYesterday = moment().subtract(1, 'days').locale(lang).format('ddd, Do MMM , h:mm a');
        this.toDate=moment().locale(lang).format('ddd, Do MMM')+' 00:00 - '+moment().locale(lang).format('h:mm a');
        this.fromDateStart=moment().subtract(1,'days').startOf('day').locale(lang).format('ddd, Do MMM')+' 00:00 - '+moment().locale(lang).format('h:mm a'); 
        setTimeout(() => {
            this.timeSeriesLoading = false;
        }, 50);
    }

    getKpiData = () => {
        this.kpiLoading = true;
        // tslint:disable-next-line:no-console
        this.OperationChartService.getOPerationKPI({ state: 'Screened', timePeriod: this.selectedFilter }).subscribe((result: IResponse<IKPIChart>) => {
            if(result && result.data && result.data.current){
              this.screenKPIVal = result.data.current;
              this.screenFlag = (result.data.changePercentage > 0) ? true : false;
              this.screenChangeVal = +result.data.changePercentage.toFixed(2);
            }
        });
        this.OperationChartService.getOPerationKPI({ state: 'Assessed', timePeriod: this.selectedFilter }).subscribe((result: IResponse<IKPIChart>) => {
            if(result && result.data && result.data.current){
              this.accessedKPIVal = result.data.current;
              this.accessedFlag = (result.data.changePercentage > 0) ? true : false;
              this.accessChangeVal = +result.data.changePercentage.toFixed(2);
            }
        });
        this.OperationChartService.getOPerationKPI({ state: 'Inspected', timePeriod: this.selectedFilter }).subscribe((result: IResponse<IKPIChart>) => {
            if(result && result.data && result.data.current){
              this.inspectedKPIVal = result.data.current;
              this.inspectedFlag = (result.data.changePercentage > 0) ? true : false;
              this.inspectChangeVal = +result.data.changePercentage.toFixed(2);
            }
        });
        this.OperationChartService.getOPerationKPI({ state: 'Suspected', timePeriod: this.selectedFilter }).subscribe((result: IResponse<IKPIChart>) => {
            if(result && result.data && result.data.current){
              this.suspectedKPIVal = result.data.current;
              this.suspectedFlag = (result.data.changePercentage > 0) ? true : false;
              this.suspectChangeVal = +result.data.changePercentage.toFixed(2);
            }
        });
        this.OperationChartService.getOPerationKPI({ state: 'Cleared', timePeriod: this.selectedFilter }).subscribe((result: IResponse<IKPIChart>) => {
            if(result && result.data && result.data.current){
                this.clearedKPIVal = result.data.current;
                this.clearedFlag = (result.data.changePercentage > 0) ? true : false;
                this.clearedChangeVal = +result.data.changePercentage.toFixed(2);
            }
        });
        setTimeout(() => {
            this.kpiLoading = false;
        }, 1000);
    }

    fetchUsers = () => {
        let finalData=[];
        this.OperationChartService.getUserData('IA').subscribe( (response) => {
            this.userList = response.data;
            this.userList.forEach( (param: IUserList) => {
                this.userQueryString+= 'users='+param.name+'&';
                finalData.push({name: param.name ,fullName:param.fullName, actual: 0, expected: 0, type: '0', status: false, colour:this.randomColor(),flip:true});
            });
            this.userGridList = finalData;
            this.getTimeSereiesData(this.userQueryString);
        }, (error) => {
            throw new Error('Unable to fetch response ');
        });
    }

    transformObjectStruct = (userList: IUserList[], timeSeries: [IOperationalineChartStructure] ) => {
        let timeSeriesUserList = [];
        for (var i =0; i< timeSeries.length; i++) {
                let userList = Object.keys(timeSeries[i]);
                timeSeriesUserList.push(userList[0]);
        }
        let finalData = [];
        this.userGridList=[];
        userList.forEach( (params) => {
            var targetResult = 0;
            var actualResult = 0;
            var indexOfUser = timeSeries[timeSeriesUserList.indexOf(params.name)];
            if(indexOfUser){
              let userDetails = indexOfUser[params.name];
              userDetails.forEach( function (params) {
                  params.target=+params.target;
                  params.actual=+params.actual;
                  targetResult += params.target;
                  actualResult += params.actual;
              });
              finalData.push({name: params.name ,fullName:params.fullName, actual: actualResult, expected: targetResult, type: '0', status: false, colour: '',flip:false});
            }else{
              finalData.push({name: params.name ,fullName:params.fullName, actual: actualResult, expected: targetResult, type: '0', status: false, colour: '',flip:true});
            }
        });

        finalData.forEach(el => {
            el.colour = this.randomColor();
            let actual=+el.actual;
            let expected=+el.expected;
            let status = actual / expected;
            if (status >= 1) {
                el.type = '1';
                el.status = false;
            } else if (status >= 0.8 && status < 1) {
                el.type = '2';
                el.status = false;
            } else if (status >= 0.05 && status < 0.8) {
                el.type = '3';
                el.status = true;
                this.selectedUsers.add(el.name);
            } else if (status < 0.05) {
                el.type = '0';
                el.status = false;
            }
        });
        this.userGridList = finalData;
    }
    getHistogramData =() => {
      this.timeSeriesLoading = true;
      this.OperationChartService.getHistogramData({users: '',duration: this.selectedFilter}).subscribe((result: IResponse<IHistogramChart>) => {
          let data = result.data;  
          let xAxis=[];
          let destuffArr=[];
          let canaineArr=[];
          xAxis.push('x');
          destuffArr.push('Destuff');
          canaineArr.push('Canaine');
          data.historgram.forEach(item => {
            xAxis.push(item.xAxis);
            destuffArr.push(item.Destuff);
            canaineArr.push(item.Canaine);
          });
          this.histogramData=[xAxis,destuffArr,canaineArr];
        }
      );
    }
    getTimeSereiesData = (userQueryString: string) => {
        this.timeSeriesLoading = true;
        this.OperationChartService.getTotalScanData({users: userQueryString, duration: this.selectedFilter}).subscribe((result: IResponse<ITimeSeriesResponse>) => {
            let data = result.data;   
             this.intermediateResult = {};  
            result.data.time_series.forEach( (res) => {
                var keys = Object.keys(res);
                this.intermediateResult[keys[0]] = res[keys[0]];
            });
            this.totalChart = {};
            if (!data.time_series || !data.time_series.length) {
                return;
            }
            this.getRegions(this.intermediateResult);
            this.transformObjectStruct(this.userList, data.time_series);
            if (this.selectedUsers.size > 0) {
                this.totalChart = this.OperationChartService.formatData(this.intermediateResult, this.selectedUsers, this.userGridList, this.selectedFilter,this.userList);
            this.columns = this.totalChart.columns;
            this.timeSeriesColor = this.totalChart.colors;
            }
            
        });
        setTimeout(() => {
            this.timeSeriesLoading = false;
        }, 1000);
    }
    getRegions = (actualUserList) => {
        let regions = {};
        for (var prop in actualUserList) {
          let fullName='';
          this.userList.forEach((val)=>{
            if(val.name===prop){
              fullName=val.fullName;
            }
           });
          regions[fullName] = [{ 'style': 'dashed' }];
        }
        this.totalChartRegion = regions;
    }
    
    randomColor =() => {
      let letters = '0123456789ABCDEF';
      let color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
    showGuageTarget = (event) => {
        this.guageChartloading = true;
        this.actual = event.actualVal;
        this.target = event.targetGuage;
        this.footerMessage = (this.actual - this.target) / 100;
        if (this.target > this.actual) {
            this.footerFlag = false;
        } else {
            this.footerFlag = true;
        }
        setTimeout(() => {
            this.guageChartloading = false;
        }, 1000);
    }
    getSwitchState = (param) => {
        if (param.status) {
            this.selectedUsers.add(param.name);
        } else {
                this.selectedUsers.delete(param.name);
        }
        this.totalChart = this.OperationChartService.formatData(this.intermediateResult, this.selectedUsers, this.userGridList, this.selectedFilter,this.userList);
        this.columns = this.totalChart.columns;
        this.timeSeriesColor = this.totalChart.colors;
    }
    sort(property) {
        this.isDesc = !this.isDesc;
        this.columnName = property;
        this.direction = this.isDesc ? 1 : -1;
    }
    ngOnInit() {
        this.getKpiData();
        this.fetchUsers();
       // this.getHistogramData();
    }
}
