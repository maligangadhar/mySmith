import { Directive, Input } from '@angular/core';
import { colType, opMode } from '../models/enums';
import { GridControlComponent } from '../controls/grid.control';
import { IKeyValue} from '../models/viewModels';


@Directive({ selector: 'sp3-column, [sp3-column]' })
export class GridColumnDirective  {
		@Input() public header: string;    
		@Input() public iconHeaderClass: string;
		@Input() public field: string;
		@Input() public controlId: string;
		@Input() public type?: colType = colType.label;
		@Input() public hasClick?: boolean = false;
		@Input() public itemOnClick?: Function;
		@Input() public editable?: boolean = false;
		@Input() public mode?: opMode = opMode.View;
		@Input() public editType?: colType = colType.label;
		@Input() public masterValues?: IKeyValue[] = [];
		@Input() public maxLengthValue?: number = 9999;
		@Input() public colWidth?: string;
		@Input() public isColFrozen?: boolean;
		public originalType?: colType = colType.label;
		@Input() public isSortable?:boolean;
		

		constructor(public gridControl: GridControlComponent) {
				this.gridControl.addColumn(this);
		}

}
