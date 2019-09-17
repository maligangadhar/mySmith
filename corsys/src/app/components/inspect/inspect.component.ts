import { Component, Inject, OnInit } from '@angular/core';
import { inspectTabs, applicationName } from '../../models/enums';
import { ActivatedRoute, Router } from '@angular/router';
import {  IStorageService } from '../../interfaces/interfaces';
@Component({
	selector: 'sp3-comp-inspect',
	templateUrl: './inspect.component.html'
})

export class InspectComponent implements OnInit {
	selectedTab: inspectTabs;
	actionTab: any = inspectTabs;
	reset: () => void;
	onTabChange: (selectedTab: inspectTabs) => void;
	getMenuState: (status: boolean) => void;
	togglePanel: boolean = false;
	constructor(@Inject('IStorageService') public storageService: IStorageService, private route: ActivatedRoute, private router: Router) {
		var vm = this;
	
		this.route.params.subscribe(params => {					
			let selTab = vm.storageService.getItem('selectedTab');
				 
			if(selTab !== '')
			{
				vm.selectedTab = selTab;			
			}				 	
			});
			vm.reset = () => {			
				if(vm.storageService.getItem('IsFromIA') === '' || vm.storageService.getItem('IsFromIA') === false)
				{
					vm.selectedTab = inspectTabs.myCases;
				}
				vm.storageService.setItem('selectedApp', applicationName.Inspection);
				vm.storageService.setItem('selectedTab', vm.selectedTab);
			};
		vm.onTabChange = (selectedTab: inspectTabs) => {
        if(selectedTab!==this.actionTab.myCases){
          this.router.navigate(['Inspection'], {queryParams: {}, preserveQueryParams: false });
        }
				vm.selectedTab = selectedTab;
				vm.storageService.setItem('selectedTab', vm.selectedTab);
		};
		vm.getMenuState = (status: boolean) => {
			vm.togglePanel = status;
		};
	}

	ngOnInit(): void {
		this.reset();
	}
}
