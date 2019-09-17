import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { IOperationalUserChart } from '../models/viewModels';

@Component ({
  selector: 'sp3-comp-inputswitch',
  templateUrl: './inputSwitch.control.html'
})

export class InputSwitchComponent {
  @Input() buttonState: boolean = false;
  @Output() getButtonState: EventEmitter<any> = new EventEmitter();
  @Input() buttonParam?: Array<any>[];
  @Input() disableSwitch: boolean = false;
  @Input() labelText: string;
  @Input() title:string='DisplayOff';
  @Input() selector?: string;

  public onChangeState() {
    
    if (this.buttonParam && this.buttonParam.length > 0) {
      this.buttonState = !this.buttonParam[this.selector];
      this.buttonParam['status'] = !this.buttonParam[this.selector];
      this.getButtonState.emit(this.buttonParam);
    } else {
      this.buttonState = !this.buttonState;
      this.getButtonState.emit(this.buttonState);
    }

    if(this.title.trim().length > 0)
      {
        this.title=(this.buttonState ? 'DisplayOn' :'DisplayOff');
      }    
  }
} 
