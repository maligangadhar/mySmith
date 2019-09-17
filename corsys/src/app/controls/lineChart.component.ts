import { Component, Input, AfterViewInit, OnChanges, SimpleChange } from '@angular/core';
import * as c3 from 'c3';
import { ILineRegionInput } from '../models/viewModels';

@Component({
    selector: 'sp3-comp-linechart',
    template: `<div class="rap-line-chart"><div id="{{chartId}}"></div></div>`
})

export class LineChartComponent implements AfterViewInit, OnChanges {

    lineChart: c3.ChartAPI;
    @Input() data: any;
    @Input() chartId: string;
    @Input() regions?: ILineRegionInput;
    @Input() lineLegends?: string[];
    @Input() bindToX?: string;
    chartObj: any;
    ngAfterViewInit(): void {
        let uTag2 = '#' + this.chartId;
        this.chartObj = {
            bindto: uTag2,
            data: {
                type: 'line',
                columns: []
            },
            legend: {
                show: false
            },
            grid: {
                y: {
                    show: true
                }
            }
        };
        this.setRegions();
        this.toggleLegends();
        this.bindToXAxis();
        this.lineChart = c3.generate(this.chartObj);

    }

    setRegions = () => {
        if (this.regions && !this.regions.dynamicRegion && Object.keys(this.regions.regions).length > 0) {
            this.chartObj.data['regions'] = this.regions.regions;
        }
    }

    toggleLegends = () => {
        if (this.lineLegends && this.lineLegends.length > 0) {
            this.chartObj['legend'] = {};
            this.chartObj.legend['hide'] = this.lineLegends;
        }
    }

    bindToXAxis = () => {
        if (this.bindToX) {
            this.chartObj.data['x'] = this.bindToX;
            this.chartObj['axis'] = {};
            this.chartObj.axis['x'] = {};
            this.chartObj.axis.x['type'] = 'category';
        }
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
        for (let prop in changes) {
            if (prop === 'data') {
                let changedProp = changes['data'];
                if (!changedProp.firstChange) {
                    this.lineChart.load(changedProp.currentValue);
                }
            }
        }
    }
}
