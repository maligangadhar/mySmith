import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IOperationalUserChart } from '../interfaces/interfaces';

@Component({
  selector: 'sp3-comp-dashboard-inputswitch',
  templateUrl: './dashboard.switch.control.html'
})

export class DashboardSwitchComponent {
  @Input() buttonState: boolean = false;
  @Input() buttonParam: IOperationalUserChart[];
  @Output() getButtonState: EventEmitter<IOperationalUserChart[]> = new EventEmitter();
  @Input() disableSwitch: boolean = false;
  public onChangeState() {
    this.buttonState = !this.buttonParam['status'];
    this.buttonParam['status'] = !this.buttonParam['status'];
    this.getButtonState.emit(this.buttonParam);
  }
} 
