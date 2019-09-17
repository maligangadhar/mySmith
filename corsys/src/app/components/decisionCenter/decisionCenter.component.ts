import { ActivatedRoute,Router } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import { controlCentreTabs, applicationName } from '../../models/enums';
import {  IStorageService } from '../../interfaces/interfaces';
  
@Component({
		selector: 'sp3-comp-control-center',
		templateUrl: './decisionCenter.component.html'
})

export class DecisionCenterComponent implements OnInit {
		selectedTab: controlCentreTabs;
		actionTab: any = controlCentreTabs;	
		onTabChange: (selectedTab: controlCentreTabs) => void;
		getMenuState: (status: boolean) => void;
    reset: () => void;
    activeTab:number=1;
		togglePanel: boolean = false;
		constructor(@Inject('IStorageService') public storageService: IStorageService,
				private route: ActivatedRoute,private router:Router) {
				var vm = this;
								
				this.route.params.subscribe(params => {					
          let selTab = vm.storageService.getItem('selectedTab');
         		
					if(selTab !== '' && vm.storageService.getItem('IsFromIA') === true)
					{
            vm.selectedTab = selTab;			
            vm.activeTab = selTab;
					}				 	
    			});

				vm.reset = () => {			
					if(vm.storageService.getItem('IsFromIA') === '' || vm.storageService.getItem('IsFromIA') === false)
					{
						vm.selectedTab = controlCentreTabs.myActions;						
					}	 
					
					vm.storageService.setItem('selectedApp', applicationName.ControlCenter);
					vm.storageService.setItem('selectedTab', vm.selectedTab);
					vm.storageService.setItem('IsFromIA', false);					
				};

				vm.onTabChange = (selectedTab: controlCentreTabs) => {	
          this.route.params.subscribe(params => {	
            if(params){
              this.router.navigate(['DecisionCentre'], {queryParams: {}, preserveQueryParams: false });			
            }
          });
          vm.selectedTab = selectedTab;
          this.activeTab=selectedTab;
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
