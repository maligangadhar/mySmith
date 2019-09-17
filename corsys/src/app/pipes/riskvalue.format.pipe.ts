import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
	name: 'sp3RiskValueFormat',
	pure: true
})

export class RiskValueFormat implements PipeTransform {
	transform(args: string): any {
		let toArray =  args.split('-');
		return toArray[1];
	}
}
