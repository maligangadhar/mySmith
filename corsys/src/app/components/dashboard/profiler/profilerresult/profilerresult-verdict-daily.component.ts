import { Component, OnInit, Inject } from '@angular/core';
import * as c3 from 'c3';
import * as moment from 'moment';
import { IProfilerChartService, ITranslateService, IAppParams, IDateFormatService } from '../../../../interfaces/interfaces';
import { IResponse, IProfilerLineChart } from '../../../../models/viewModels';
@Component({
  selector: 'sp3-comp-profilerresult-verdict-daily-component',
  templateUrl: 'profilerresult-verdict-daily.component.html'
})

export class ProfilerresultVerdictDailyComponent implements OnInit {
  histogramChart: c3.ChartAPI;
  clear: string = this.translateService.instant('Clear');
  suspect: string = this.translateService.instant('Suspect');
  verdictDailyloading: boolean = false;
  constructor(
    @Inject('IProfilerChartService') private profilerChartService: IProfilerChartService,
    @Inject('ITranslateService') public translateService: ITranslateService,
    @Inject('IAppParams') private config: IAppParams,
    @Inject('IDateFormatService') private dateFormatService: IDateFormatService) { }
  getProfilerResult = () => {
    let fromDate = new Date();
    let toDate = new Date();

    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    let fromDateinISOFormat = moment(fromDate, moment.ISO_8601).subtract(30, 'days').format();
    let toDateinISOFormat = moment(toDate, moment.ISO_8601).subtract(1, 'days').format();
    this.verdictDailyloading = true;
    this.profilerChartService.getData(this.config.getParams().casesUrl + '/risk', { 'filter': 'DateOfArrival^IN^(' + fromDateinISOFormat + ',' + toDateinISOFormat + ')^AND^GROUPBY(DateOfArrival)' }).subscribe((result: IResponse<IProfilerLineChart[]>) => {
      let data = result['data']['riskItems'];

      let columnXData = [];
      let clearArr = [];
      let suspectArr = [];
      let mainArr = [];

      columnXData.push('x');
      clearArr.push(this.clear);
      suspectArr.push(this.suspect);

      data.sort( (a, b) => {
        let param1: any = new Date(a.date);
        let param2: any = new Date(b.date);
        return param1 - param2;
      });

      data.forEach(item => {
        let total = 0;
        total = item.red;
        let operationDateObject = this.dateFormatService.operationalDate(item.date);
        if(moment(operationDateObject).isValid()){
          columnXData.push(this.dateFormatService.formatDate(operationDateObject));
          clearArr.push((total > 0 ? (item.clearCount * 100 / total) : 0).toFixed(2));
          suspectArr.push((total > 0 ? (item.suspectCount * 100 / total) : 0).toFixed(2));
        }
      });
      mainArr.push(columnXData);
      mainArr.push(clearArr);
      mainArr.push(suspectArr);
      this.prepareHistogramData(mainArr);
      this.verdictDailyloading = false;
    });
  }
  prepareHistogramData = (mainArr) => {
    c3.generate({
      bindto: '#verdictScreeningDailyChart',
      data: {
        x: 'x',
        columns: mainArr,
        order: 'true',
        types: {
          'Clear_FR': 'area',
          'Suspect_FR': 'area',
          'Clear': 'area',
          'Suspect': 'area',
          'Suspect_DE': 'area',
          'Clear_DE': 'area'
        },
        colors: {
          Suspect: 'rgba(202, 58, 58, 0.6)',
          Clear: 'rgba(41, 158, 217, 0.6)',
          Suspect_DE: 'rgba(202, 58, 58, 0.6)',
          Clear_DE: 'rgba(41, 158, 217, 0.6)',
          Suspect_FR: 'rgba(202, 58, 58, 0.6)',
          Clear_FR: 'rgba(41, 158, 217, 0.6)'
        },
        groups: [[this.clear,this.suspect]]
      },
      size: {
        height: 370
      },
      point: {
        show: false
      },
      axis: {
        x: {
          min: 1,
          type: 'category',
          tick: {
            rotate: 60,
            multiline: false
          },
          height: 90
        },
        y: {
          min: 10,
          max: 100,
          tick: {
            format: function (d) { return d + '%'; }
          }
        }
      }
    });
  }
  ngOnInit() {
    this.getProfilerResult();
  }
}
