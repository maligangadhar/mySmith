import { Component, OnInit, Inject } from '@angular/core';
import * as c3 from 'c3';
import { IProfilerChartService, ITranslateService, IAppParams, IDateFormatService } from '../../../../interfaces/interfaces';
import * as moment from 'moment';
import { IResponse, IProfilerLineChart } from '../../../../models/viewModels';
@Component({
  selector: 'sp3-comp-profilerresult-screening-daily-component',
  templateUrl: 'profilerresult-screening-daily.component.html'
})

export class ProfilerresultScreeningDailyComponent implements OnInit {
  histogramChart: c3.ChartAPI;
  profileResultChartloading:boolean=false;
  blue: string = this.translateService.instant('Blue');
  amber: string = this.translateService.instant('Amber');
  red: string = this.translateService.instant('Red');
  constructor(
    @Inject('IProfilerChartService') private profilerChartService: IProfilerChartService,
    @Inject('ITranslateService') public translateService: ITranslateService,
    @Inject('IAppParams') private config: IAppParams,
    @Inject('IDateFormatService') private dateFormatService: IDateFormatService) { }
    
    getProfilerResult=() => {
      let fromDate = new Date();
      let toDate = new Date();
      fromDate.setHours(0,0,0,0);
      toDate.setHours(23, 59, 59, 999);
      let fromDateinISOFormat = moment(fromDate, moment.ISO_8601).subtract(30, 'days').format();
      let toDateinISOFormat = moment(toDate, moment.ISO_8601).subtract(1, 'days').format();
       this.profileResultChartloading=true;
       this.profilerChartService.getData(this.config.getParams().casesUrl+'/risk', { 'filter': 'DateOfArrival^IN^(' + fromDateinISOFormat + ',' + toDateinISOFormat + ')^AND^GROUPBY(DateOfArrival)' }).subscribe((result: IResponse<IProfilerLineChart[]>) => {
         let data = result['data']['riskItems'];

         let columnXData=[];
         let redArr=[];
         let blueArr=[];
         let amberArr=[];
         let mainArr=[];

         columnXData.push('x');
         redArr.push(this.red);
         blueArr.push(this.blue);
         amberArr.push(this.amber);
        
         data.sort( (a, b) => {
          let param1: any = new Date(a.date);
          let param2: any = new Date(b.date);
          return param1 - param2;
        });

         data.forEach(item => {
            let total=0;
            total=item.red+item.blue+item.yellow;
            let operationDateObject = this.dateFormatService.operationalDate(item.date);
            if(total>0){
              columnXData.push(this.dateFormatService.formatDate(operationDateObject));
              redArr.push((item.red*100/total).toFixed(2));
              blueArr.push((item.blue*100/total).toFixed(2));
              amberArr.push((item.yellow*100/total).toFixed(2));
            }
         });
         mainArr.push(columnXData);
         mainArr.push(blueArr);
         mainArr.push(amberArr);
         mainArr.push(redArr);
         this.prepareHistogramData(mainArr);
         this.profileResultChartloading=false;
       });
   }
    prepareHistogramData=(mainArr) => {
      c3.generate({
        bindto: '#screenDailyChart',
        data: {
          x : 'x',
          columns:mainArr,
          order:'true',
          types: {
            Red: 'area',
            Amber: 'area',
            Blue: 'area',
            Red_DE: 'area',
            Amber_DE: 'area',
            Blue_DE: 'area',
            Red_FR: 'area',
            Amber_FR: 'area',
            Blue_FR: 'area'
          },
          colors: {
            Red: 'rgba(202, 58, 58, 0.6)',
            Amber: 'rgba(220, 118, 51, 0.6)',
            Blue: 'rgba(41, 158, 217, 0.6)',
            Red_DE: 'rgba(202, 58, 58, 0.6)',
            Amber_DE: 'rgba(220, 118, 51, 0.6)',
            Blue_DE: 'rgba(41, 158, 217, 0.6)',
            Red_FR: 'rgba(202, 58, 58, 0.6)',
            Amber_FR: 'rgba(220, 118, 51, 0.6)',
            Blue_FR: 'rgba(41, 158, 217, 0.6)'
         },
         groups: [[this.red,this.amber,this.blue]]
      },
      size:{
        height:370
      },
      point: {
          show: false
      },
      axis: {
        x: {
            min:0.5,
            type: 'category',
            tick: {
                rotate: 60,
                multiline: false
            },
            height: 90
        },
        y:{
            min:10,
            max:100,
            tick: {
                    format: function (d) { return  d+'%'; }
            }
        }
    }
    });
  }
  ngOnInit() {
    this.getProfilerResult();
   }
}
