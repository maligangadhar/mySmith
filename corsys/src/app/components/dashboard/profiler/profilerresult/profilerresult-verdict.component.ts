import { Component, OnInit, Inject } from '@angular/core';
import * as c3 from 'c3';
import * as moment from 'moment';
import { IProfilerChartService, ITranslateService, IAppParams } from '../../../../interfaces/interfaces';
import { IResponse, IProfilerLineChart } from '../../../../models/viewModels';

@Component({
  selector: 'sp3-comp-profilerresult-verdict-component',
  templateUrl: 'profilerresult-verdict.component.html'
})

export class ProfilerResultVerdictComponent implements OnInit {
  histogramChart: c3.ChartAPI;
  verdictHistogramChartloading:boolean=false;
  clear: string = this.translateService.instant('Clear');
  suspect: string = this.translateService.instant('Suspect');
  constructor(
     @Inject('IProfilerChartService') private profilerChartService: IProfilerChartService,
     @Inject('ITranslateService') public translateService: ITranslateService, @Inject('IAppParams') private config: IAppParams) { }
     getVerdictResult=() => {
      let fromDate = new Date();
      let toDate = new Date();
      fromDate.setHours(0,0,0,0);
      toDate.setHours(23, 59, 59, 999);
      let fromDateinISOFormat = moment(fromDate, moment.ISO_8601).subtract(30, 'days').format();
      let toDateinISOFormat = moment(toDate, moment.ISO_8601).subtract(1, 'days').format();
        this.verdictHistogramChartloading=true;
        this.profilerChartService.getData(this.config.getParams().casesUrl+'/risk', { 'filter': 'DateOfArrival^IN^(' + fromDateinISOFormat + ',' + toDateinISOFormat + ')^AND^GROUPBY(DateOfArrival)' }).subscribe((result: IResponse<IProfilerLineChart[]>) => {
          let data = result['data']['total'];
          let totalCount=data.red;
          let clearCount=(data.redClearCount*100)/totalCount;
          let suspectCount=(data.redSuspectCount*100)/totalCount;
          clearCount=+clearCount.toFixed(2);
          suspectCount=+suspectCount.toFixed(2);
          this.prepareHistogramData(clearCount,suspectCount);
          this.verdictHistogramChartloading=false;
        });
    }
     prepareHistogramData=(clearCount,suspectCount) => {
       c3.generate({
        bindto: '#verdictHistogramChart',
        data: {
          columns: [
            [this.clear, clearCount],
            [this.suspect, suspectCount]
          ],
          order: 'true',
          colors: {
            Suspect: 'rgba(202, 58, 58, 0.6)',
            Clear: 'rgba(41, 158, 217, 0.6)',
            Suspect_DE: 'rgba(202, 58, 58, 0.6)',
            Clear_DE: 'rgba(41, 158, 217, 0.6)',
            Suspect_FR: 'rgba(202, 58, 58, 0.6)',
            Clear_FR: 'rgba(41, 158, 217, 0.6)'
          },
          type: 'bar',
          groups: [
            [this.suspect,this.clear]
          ]
      },
      axis: {
          x: {
              label: {
                 // text: 'Total',
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
    this.getVerdictResult();
   }

}
