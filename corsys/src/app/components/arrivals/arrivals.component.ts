import { Component, ViewChild } from '@angular/core';
import { arrivalsTabs } from '../../models/enums';
import { ModalCaseCreationComponent } from '../modal/modal.case.creation.component';

@Component({
		selector: 'sp3-comp-arrivals',
		templateUrl: './arrivals.component.html'
})

export class ArrivalsComponent {
	@ViewChild('modal') modal: ModalCaseCreationComponent;
	selectedTab: arrivalsTabs;
	actionTab: any = arrivalsTabs;
	onTabChange: (selectedTab: arrivalsTabs) => void;
	getMenuState: (status: boolean) => void;
	togglePanel: boolean = false;
	
	constructor() {
			
			var vm = this;

			vm.selectedTab = arrivalsTabs.myCases;

			vm.onTabChange = (selectedTab: arrivalsTabs) => {
					vm.selectedTab = selectedTab;
			};
			vm.getMenuState = (status: boolean) => {
					vm.togglePanel = status;
			};
	}
}
