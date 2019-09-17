import { Pipe, PipeTransform, Inject } from '@angular/core';
import { ITimeFormatService } from '../interfaces/interfaces';

@Pipe({
		name: 'sp3TimeFormat',
		pure: true
})

export class TimeFormatPipe implements PipeTransform {
		constructor(@Inject('IDateFormatService') private timeFormatService: ITimeFormatService){}
		transform(value: string, arg?: string) {
				return !value ? '': this.timeFormatService.formatTime(value, arg? arg: '');
		}

}
