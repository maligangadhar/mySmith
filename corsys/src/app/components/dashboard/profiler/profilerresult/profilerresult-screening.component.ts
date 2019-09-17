import { Component, OnInit, Inject } from '@angular/core';
import * as c3 from 'c3';
import * as moment from 'moment';
import { IProfilerChartService, ITranslateService, IAppParams } from '../../../../interfaces/interfaces';
import { IResponse, IProfilerLineChart } from '../../../../models/viewModels';
@Component({
  selector: 'sp3-comp-profilerresult-screening-component',
  templateUrl: 'profilerresult-screening.component.html'})

export class ProfilerresultScreeningComponent implements OnInit {
  histogramChart: c3.ChartAPI;
  resultHistogramChartloading:boolean=false;
  blue: string = this.translateService.instant('Blue');
  amber: string = this.translateService.instant('Amber');
  red: string = this.translateService.instant('Red');
  constructor(
     @Inject('IProfilerChartService') private profilerChartService: IProfilerChartService,
     @Inject('ITranslateService') public translateService: ITranslateService,
     @Inject('IAppParams') private config: IAppParams) { }
     getProfilerResult=() => {
        this.resultHistogramChartloading=true;
        let fromDate = new Date();
        let toDate = new Date();
        fromDate.setHours(0,0,0,0);
        toDate.setHours(23, 59, 59, 999);
        let fromDateinISOFormat = moment(fromDate, moment.ISO_8601).subtract(30, 'days').format();
        let toDateinISOFormat = moment(toDate, moment.ISO_8601).subtract(1, 'days').format();
        this.profilerChartService.getData(this.config.getParams().casesUrl+'/risk', { 'filter': 'DateOfArrival^IN^(' + fromDateinISOFormat + ',' + toDateinISOFormat + ')^AND^GROUPBY(DateOfArrival)' }).subscribe((result: IResponse<IProfilerLineChart[]>) => {
          let data = result['data']['total'];
          let totalCount=data.red+data.blue+data.yellow;
          let redPercent=((data.red*100)/totalCount).toFixed(2);
          let amberPercent=((data.yellow*100)/totalCount).toFixed(2);
          let bluePercent=((data.blue*100)/totalCount).toFixed(2);
          this.prepareHistogramData(redPercent,amberPercent,bluePercent);
          this.resultHistogramChartloading=false;
        });
    }
     prepareHistogramData=(redPercent,amberPercent,bluePercent) => {
      c3.generate({
        bindto: '#screeningHistogramChart',
        data: {
          columns: [
              [this.blue, bluePercent],
              [this.amber, amberPercent],
              [this.red, redPercent]
          ],
          order: 'true',
          colors: {
            Red: 'rgba(202, 58, 58, 0.6)',
            Amber: 'rgba(220, 118, 51, 0.6)',
            Blue: 'rgba(41, 158, 217, 0.6)',
            Red_DE: 'rgba(202, 58, 58, 0.6)',
            Amber_DE: 'rgba(220, 118, 51, 0.6)',
            Blue_DE: 'rgba(41, 158, 217, 0.6)',
            Red_FR: 'rgba(202, 58, 58, 0.6)',
            Amber_FR: 'rgba(220, 118, 51, 0.6)',
            Blue_FR: 'rgba(41, 158, 217, 0.6)',
        },
          type: 'bar',
          groups: [
              [this.red,this.amber,this.blue]
          ]
      },
      axis: {
        x: {
            label: {
                //text: 'Total',
                position: 'outer-center'
            }
        },
        y:{
          min:10,
          max:100,
          tick: {
                 format: function (d) { return  d+'%'; }
          }
      }
      },
       grid: {
                y: {
                    show: true
                }
            }
    });
  }
  ngOnInit() {
    this.getProfilerResult();
   }
}
