import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
@Component( {
  selector: 'sp3-comp-slider',
  templateUrl: './slider.control.html'
})

export class SP3SliderComponent {
  @Input() range: number;
  @Input() label: string;
  @Output() rangeChanged = new EventEmitter<number>();
  @Input() emitChangeFlag: boolean = false;
  onValueChanged: () => void;
   

  searchFormControl = new FormControl();
     	constructor() {
     	  var vm = this;
     	  vm.onValueChanged = () => {
           vm.emitChangeFlag = true;
        };
     	    vm.searchFormControl.valueChanges.debounceTime(500)
				.subscribe((newValue: any) => {
            if (vm.emitChangeFlag) {
              vm.rangeChanged.emit(vm.range);
            }
				});
     	}
}
