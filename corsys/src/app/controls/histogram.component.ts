import * as c3 from 'c3';
import { Component, OnInit, Input, Inject, OnDestroy, SimpleChange, OnChanges } from '@angular/core';
import { ITranslateService, IOperationalChartService } from '../interfaces/interfaces';
import { ITimeSeriesRequestFormat } from '../models/viewModels';
import { responseStatus } from '../models/enums';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'sp3-comp-histogram-component',
  template: `
      <div id="histogramChart"></div>
  `
})

export class HistogramComponent implements OnInit, OnDestroy, OnChanges {
  destuff: string = this.translateService.instant('Destuff');
  canine: string = this.translateService.instant('Canine');
  durationMin: string = this.translateService.instant('DurationHrs');
  histogramChart: c3.ChartAPI;
  ngUnsubscribe: Subject<any> = new Subject<any>();
  timeseriesRequest: ITimeSeriesRequestFormat = { users: '', duration: 'today' };

  @Input() data: any;
  @Input() selectedFilter: any;
  constructor( @Inject('ITranslateService') public translateService: ITranslateService,
    @Inject('IOperationalChartService') public operationChartService: IOperationalChartService) { }
  prepareGaugeData = () => {

    this.operationChartService.getHistogramData(this.timeseriesRequest).takeUntil(this.ngUnsubscribe).subscribe(result => {
      if (result.status === responseStatus.Success) {
        let data = result.data;
        let keys = Object.keys(data.destuff);
        let destufObj = Object.values(data.destuff);
        let canineObj = Object.values(data.canine);

        let xAxisValues = [];
        let destuffValues = [];
        let canineValues = [];

        xAxisValues.push('x');
        destuffValues.push(this.destuff);
        canineValues.push(this.canine);

        keys.forEach((duration) => {
          if (xAxisValues.length <= 24) {
            xAxisValues.push(+duration);
          }
        });
        destufObj.forEach((destuff) => {
          if (destuffValues.length <= 24) {
            destuffValues.push(destuff);
          }
        });
        canineObj.forEach((destuff) => {
          if (canineValues.length <= 24) {
            canineValues.push(destuff);
          }
        });
        c3.generate({
          bindto: '#histogramChart',
          data: {
            x: 'x',
            //   columns: [
            //     ['x',1,2,3,4,5,6],
            //     [this.destuff, 300, 350, 300, 30, 30, 250],
            //     [this.canine, 130, 100, 140, 200, 150, 50]
            // ],
            // columns: [
            //   ['x', Array.apply(null, {length: data.destuff.length}).map((val,index)=> index * 5, Number)],
            //   [this.destuff, data.destuff.join()],
            //   [this.canine, data.canine.join()]
            // ],
            columns: [
              xAxisValues,
              destuffValues,
              canineValues
            ],
            types: {
              'De-Stuff_FR': 'area-spline',
              'Canine_FR': 'area-spline',
              'destuff': 'area-spline',
              'canine': 'area-spline',
              'De-Stuff_DE': 'area-spline',
              'Canine_DE': 'area-spline',
              'De-stuff': 'area-spline',
              'Canine': 'area-spline'
            }
          },
          axis: {
            x: {
              label: {
                text: this.durationMin,
                position: 'outer-center'
              }
            }
          }
        });
      }
    }, (error) => {
      throw new Error('Could not load inspection duration histogram ');
    });
  }

  ngOnInit() {
    this.prepareGaugeData();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
    for (let prop in changes) {
      if (prop === 'selectedFilter') {
        let currentValue = changes['selectedFilter'].currentValue;
        if (currentValue) {
          this.timeseriesRequest.duration = currentValue;
          this.prepareGaugeData();
        }
      }
    }
  }
}
