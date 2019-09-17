import { Pipe, PipeTransform } from '@angular/core';

import { IApp } from '../models/viewModels';

@Pipe({
		name: 'sp3FilterAppContent'
})

export class FilterAppListContentPipe implements PipeTransform {
		transform(apps: IApp[], filterBy: string): IApp[] {

				filterBy = filterBy ? filterBy.toLocaleLowerCase() : null;

				return filterBy ? apps.filter((app: IApp) => {
						return app.name.toLocaleLowerCase().indexOf(filterBy) !== -1;
				}) : apps;

		}
}
