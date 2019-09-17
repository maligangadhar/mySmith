import { Pipe, PipeTransform } from '@angular/core';

import { IRole } from '../models/viewModels';

@Pipe({
		name: 'sp3FilterRoleContent'
})

export class FilterRoleListContentPipe implements PipeTransform{
		transform(roles: IRole[], filterBy: string): IRole[] {
				
				filterBy = filterBy ? filterBy.toLocaleLowerCase() : null;
				
				return filterBy ? roles.filter( (role: IRole) => {
						return role.name.toLocaleLowerCase().indexOf(filterBy) !== -1;
				} ): roles;

		}
}
