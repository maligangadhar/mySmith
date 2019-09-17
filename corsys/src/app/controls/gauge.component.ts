import * as c3 from 'c3';
import * as d3 from 'd3';
import * as moment from 'moment';
import { OnInit, Component, OnChanges, Input, Output, EventEmitter, SimpleChange, Inject } from '@angular/core';
import { IResponse, ITimeSeriesResponse, IUserList } from '../models/viewModels';
import { IOperationalChartService } from '../interfaces/interfaces';

@Component({
    selector: 'sp3-comp-gauge-component',
    template: `
        <div id="guageChart"></div>
    `
})

export class GaugeComponent implements OnInit, OnChanges {
    guageChart: c3.ChartAPI;
    targetGuage: number = 0;
    userString: string = '';
    actualVal: number = 0;
    @Input() public dataChange: boolean = false;
    @Input() public selectedUsers: Set<string> = new Set<string>();
    @Input() selectedFilter: string = 'today';
    @Output() showGuageTarget: EventEmitter<any> = new EventEmitter();
    constructor(@Inject('IOperationalChartService') public OperationChartService: IOperationalChartService) { }
    fetchChartConfig = (param: string) => {
        this.OperationChartService.getTotalScanData({users: param, duration: this.selectedFilter}).subscribe((result: IResponse<ITimeSeriesResponse>) => {
            let data = {};
            result.data.time_series.forEach( (res) => {
                var keys = Object.keys(res);
                data[keys[0]] = res[keys[0]];
            });
            this.actualVal = 0;
            this.targetGuage = 0;
            let userKey = Object.keys(data);
            let userValues = Object.keys(data).map(key => data[key]);
            let timeFrom = moment().subtract(1, 'hour').hour();
            let timeTo = moment().hour();
            userKey.forEach((user, index) => {
                userValues[index].forEach((childItem) => {
                    let timeSlotHr = +moment(childItem.timeslot).hour();
                    let timeSlot = moment(childItem.timeslot);
                    let actual=+childItem.actual;
                    let target=+childItem.target;
                    if (moment(timeSlot).isAfter(moment().startOf('day')) && moment(timeSlot).isBefore(moment()) && timeSlotHr >= timeFrom && timeSlotHr < timeTo) {
                      this.actualVal += actual;
                      this.targetGuage += target;  
                    }
                });
            });
            let guageData = {
                'guageMaxVal': Math.floor(this.targetGuage + (this.targetGuage * 50 / 100)),
                'actualVal': this.actualVal,
                'targetGuage': this.targetGuage
            };
            this.showGuageTarget.emit(guageData);
            this.prepareGuageChart(guageData);
        });
    }
    prepareGuageChart = (guageData) => {
        let guageAcutal = 0;
        let guageTarget = 0;
        let actualLabel = 'Actual';
        let targetLabel = 'Target';
        let min = 0;
        let max = guageData.guageMaxVal;
        let indicator = guageData.actualVal;
        let needleVal = +indicator;
        if (guageData.actualVal > guageData.targetGuage) {
            guageAcutal = guageData.targetGuage;
            guageTarget = guageData.actualVal;
            actualLabel = 'Target';
            targetLabel = 'Actual';
        } else {
            guageAcutal = guageData.actualVal;
            guageTarget = guageData.targetGuage;
        }
        this.guageChart = c3.generate({
            bindto: '#guageChart',
            data: {
                columns: [
                    [targetLabel, guageTarget],
                    [actualLabel, guageAcutal]
                ],
                type: 'gauge'
            },
            gauge: {
                label: {
                    format: function (value, ratio) {
                        return guageData.actualVal;

                    },
                    show: true
                },
                width: 60,
                max: guageData.guageMaxVal
            },
            color: {
                // pattern: ['#F6C600', '#f4d8d8', '#299ed9'], 
                // pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], 
                //pattern: ['green', 'red', 'blue', 'red'], 
                //pattern: ['','green', 'red', 'orange', 'green'],
                pattern: ['#f4d8d8', '#299ed9', '#f4d8d8'],
                threshold: {
                    values: [guageAcutal, guageAcutal, guageTarget]
                }
            },
            size: {
                height: 150,
                width: 250
            }
        });
        // var needleData = [(needleVal / max - min) * 100];
        setTimeout(function () {
            d3.select('.c3-chart-arc').append('rect')
                .attr('width', 3)
                .attr('height', 125)
                .attr('transform', 'translate(0,0)rotate(' + ((needleVal / (max - min)) * 180 + 90 ) + ')')
                .attr('fill', '#299ed9');

            d3.select('.c3-chart-arc').append('circle')
                .attr('r', 30)
                .attr('fill', 'white');
        }, 500);
    }

    prepareGaugeData = () => {
        this.OperationChartService.getUserData('IA').subscribe( (response) => {
            this.userString = '';
            response.data.forEach( (param: IUserList) => {
                this.userString+= 'users='+param.name+'&';
            });
            this.fetchChartConfig(this.userString);
            // this.getTimeSereiesData(this.userQueryString);
        }, (error) => {
            throw new Error('Unable to fetch response ');
        });
    }

    ngOnInit(): void {
        this.prepareGaugeData();
    }
    /* ngOnChanges(changes: SimpleChanges): void {
        throw new Error("Method not implemented.");
    } */

    ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
        for (let prop in changes) {
            if (prop === 'selectedFilter') {
                let changedProp = changes['selectedFilter'];
                if (!changedProp.firstChange) {
                   this.fetchChartConfig(this.userString); 
                }
            }
        }
    }
} 

