import { Component, Inject, Input, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { opMode } from '../../models/enums';
import { ISortService } from '../../interfaces/interfaces';

@Component({
  selector: 'sp3-comp-app-applicationsettings',
  templateUrl: './applicationsettings.component.html'
})
export class ApplicationsettingsComponent implements OnInit {
  ngOnInit(): void {
   // throw new Error("Method not implemented.");
  }

  @Input() public controlId: string;
  @Input() public mode: opMode;
  @Input() public cardType: number;
  @Input() public column1Visible: boolean = true;

  @ViewChild('roleViewTemplate') roleViewTemplate: TemplateRef<any>;
  @ViewChild('userViewTemplate') userViewTemplate: TemplateRef<any>;
  @ViewChild('userViewTemplate') appViewTemplate: TemplateRef<any>;
  @ViewChild('generalSettingTemplate') generalSettingTemplate: TemplateRef<any>;
  @ViewChild('roleDetailTemplate') roleDetailTemplate: TemplateRef<any>;
  @ViewChild('userDetailTemplate') userDetailTemplate: TemplateRef<any>;
  @ViewChild('appDetailTemplate') appDetailTemplate: TemplateRef<any>;
  @ViewChild('appTemplate') appTemplate: any;
  @ViewChild('roleTemplate') roleTemplate: any;
  @ViewChild('createUserRoleTemplate') createUserRoleTemplate: any;
  @ViewChild('userHeaderTemplate') userHeaderTemplate: TemplateRef<any>;
  @ViewChild('roleHeaderTemplate') roleHeaderTemplate: TemplateRef<any>;
  @ViewChild('applicationHeaderTemplate') applicationHeaderTemplate: TemplateRef<any>;
  innerControlHeight: number = window.innerHeight - 48;
  isHideDetails: boolean = false;
  onFilterChange:(showDetail:boolean) => void;
  constructor(@Inject('ISortService') sortService: ISortService) { 
    var vm = this;

    vm.onFilterChange = (showDetail:boolean) => {
        vm.isHideDetails = !showDetail;
    };
    window.addEventListener('orientationchange', function() {
      vm.innerControlHeight = window.innerHeight - 48;
    });

  }

}
