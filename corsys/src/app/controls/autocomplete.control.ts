import { Component, Input, Output, EventEmitter } from '@angular/core';
import { controlCenterColumn } from '../models/enums';

@Component({
		selector: 'sp3-comp-autocomplete',
		templateUrl: './autocomplete.control.html'
})

export class SpAutocompleteComponent {
		selectedSearch: any[];

		@Input() public placeholder?: string;
		@Input() public suggestions?: any[];
		@Input() public multiple?: boolean = false;
		@Input() searchCompleteMethod?: Function;
		@Input() public minLength?: string;
		@Input() public displayFieldName?: boolean = true;
		@Input() OnSelectionMethod?: Function;
		@Output() selectionChanged = new EventEmitter();
		@Output() searchQueryChanged = new EventEmitter();
		@Output() OnBlur = new EventEmitter();
		public controlCenterColumn?: controlCenterColumn;

		public onSearch = (event: any) => {
				this.searchQueryChanged.next(event);
		}

		public onSelection = (event: any) => {
				this.selectionChanged.next(event);
		}

		onBlur(event: any) { 
			this.OnBlur.next(event);
		}

		onEnterKeyPressed(event) {

			if (event.keyCode === 13) {
				this.searchQueryChanged.next(null);
				let value = event.target.value;
				this.selectionChanged.next({
						'fieldName': null,
						'fieldValue': value,
				});
				if(this.suggestions)
				{		
					this.suggestions = [];													
				}
			} else {
				return;
			}
									
		}		
}
