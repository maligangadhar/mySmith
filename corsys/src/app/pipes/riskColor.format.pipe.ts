import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
	name: 'sp3RiskColorFormat',
	pure: true
})

export class RiskColorFormat implements PipeTransform {
	transform(args: string): any {
		let toArray =  args.split('-');
		return toArray[0];
	}
}
