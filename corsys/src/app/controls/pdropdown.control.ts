import { Component, Input, EventEmitter, Output } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
@Component({
selector: 'sp3-comp-pdropdown',
  templateUrl: './pdropdown.control.html'
})

export class SpPDropDownComponent {
  @Input() itemList: SelectItem[];
  @Input() selectedItem: Object;
  @Input() disabled: boolean = false;
  @Output() fetchChangedEvent: EventEmitter<Object> = new EventEmitter();
  onChangeEvent: (event) => void;
  constructor() {
    this.onChangeEvent = (event) => {
      this.fetchChangedEvent.emit(event);
    };
  }
}
