import * as c3 from 'c3';
import * as d3 from 'd3';
import { Component, OnInit, OnChanges, Input, EventEmitter, Output, SimpleChange } from '@angular/core';
@Component({
    selector: 'sp3-comp-timeseries-chart',
    template: `
        <div class="rap-line-chart" id="timeSeriesChart"></div>
    `
})

export class TimeSeriesComponent implements OnInit, OnChanges {
    timeseriesChart: c3.ChartAPI;
    targetGuage: number = 0;
    @Input() public hourlyScans: number;
    @Input() public data: any[] = [];
    @Input() public colors: any;
    @Input() public regions: any;
    @Output() showGuageTarget: EventEmitter<any> = new EventEmitter();
    prepareTimeseriesChart = () => {
        this.timeseriesChart = c3.generate({
            bindto: '#timeSeriesChart',
            data: {
                x: 'date',
                columns: this.data,
                regions: this.regions,
                order: null
            },
            size: {
                height: 480,
              },
            legend: {
                show: false
            },
            color: {
                pattern: this.colors
            },
            axis: {
                x: {
                    min: 0,
                    type: 'category',
                    tick: {
                        format: '%H:%M %p',
                    }
                },
                y: {
                    min: 0,
                    tick: {
                        format: d3.format('d')
                    },
                    padding: { top: 0, bottom: 0 }
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
        this.prepareTimeseriesChart();
    }
    ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
        for (let prop in changes) {
            if (prop === 'data') {
                let changedProp = changes['data'];
                if (!changedProp.firstChange) {
                    this.timeseriesChart.unload();
                    this.timeseriesChart.flush();
                    this.prepareTimeseriesChart();
                }
            }
        }
    }
}
