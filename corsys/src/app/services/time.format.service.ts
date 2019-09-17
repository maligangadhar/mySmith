import { ITimeFormatService, IStorageService } from '../interfaces/interfaces';
import { Injectable, Inject } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class TimeFormatService implements ITimeFormatService {
		formatTime: (time: string, format?: string) => string;
		constructor(@Inject('IStorageService') storageService: IStorageService) {
				var vm = this;
				vm.formatTime = (time: string, format?: string) => {
						let timeFormat: string = 'hh:mm';
						if(format) {
								timeFormat = format;
						} else {
								timeFormat = storageService.getItem('generalFormat').timeFormat;
						}
						//moment understands 'a' instead of 'tt'
						let newTimeFormat: string = timeFormat.replace('tt', 'a');
						let formattedTime: string = moment.utc(time).format(newTimeFormat);
						return formattedTime;
				};
		}
}
