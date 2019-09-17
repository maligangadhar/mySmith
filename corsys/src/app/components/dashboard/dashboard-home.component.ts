import { Component } from '@angular/core';
import { dashboardTabs } from '../../models/enums';
  
@Component({
  selector: 'sp3-comp-dashboard',
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent {
  title: string = 'Dashboard';
  selectedTab: dashboardTabs;
  actionTab: any = dashboardTabs;
  togglePanel: boolean = false;
  getMenuState: (status: boolean) => void;
  onTabChange: (selectedTab: dashboardTabs) => void;
  constructor( ) {
    var vm = this;
    vm.selectedTab = dashboardTabs.operationalDashboard;

    vm.onTabChange = (selectedTab: dashboardTabs) => {
      vm.selectedTab = selectedTab;
    };

    vm.getMenuState = (status: boolean) => {
      vm.togglePanel = status;
    };
  }
}
