import { Injectable, Inject } from '@angular/core';
import { IProfilerChartService, IDateFormatService } from '../interfaces/interfaces';
import { SecureService } from './secure.adal.service';
import { IProfilerLineChart, ICustomPatterns } from '../models/viewModels';
import { URLSearchParams } from '@angular/http';
@Injectable()
export class ProfilerDashBoardService implements IProfilerChartService {

    constructor(@Inject('IDateFormatService') private dateFormatService: IDateFormatService, private http: SecureService) { }
    getData = (url: string, params: Object): any => {
        let urlParams = new URLSearchParams();
        for (let param in params) {
            urlParams.set(param, params[param]);
        }
        return this.http.get(url, params);
    }
    getGeneralData = (url: string): any => {
        return this.http.get(url);
    }
    
    formatData = (obj: IProfilerLineChart[], colorPatterns?: ICustomPatterns | string[], dataNames?: ICustomPatterns) => {
        var formattedObject = {
            columns: []
        };
        for (var prop in obj[0]) {
            if (obj[0].hasOwnProperty(prop)) {
                let subArr = [];
                subArr.push(prop);
                obj.forEach((param: IProfilerLineChart) => {
                    if (prop === 'date') {
                        let obj = JSON.parse(JSON.stringify(param[prop]));
                        let formattedDate = this.dateFormatService.formatDate(new Date(obj));
                        subArr.push(formattedDate);
                    } 
                    else if (prop === 'actual' || prop === 'expected') {
                        let obj = JSON.parse(JSON.stringify(param[prop]));                      
                        let formattedValue = +obj.toFixed(2);
						subArr.push(formattedValue);						
                    }


                });
                formattedObject.columns.push(subArr);
            }
        }

        if (Object.keys(colorPatterns).length > 0) {
            formattedObject['colors'] = colorPatterns;
        }

        if (Object.keys(dataNames).length > 0) {
            formattedObject['names'] = dataNames;
        }
        return formattedObject;
    }
}
