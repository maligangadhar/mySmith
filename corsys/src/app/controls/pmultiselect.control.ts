import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SelectItem } from 'primeng/primeng';

@Component({
  selector: 'sp3-comp-multiselect',
  template: ` <p-multiSelect [filter]="false" defaultLabel="{{'Choose' | sp3Translate}}" [options]="multiSelectOptions" [(ngModel)]="selectedOption" (onChange)="onSelectionChange($event)" [disabled]="disabled"></p-multiSelect>`
})

export class SpPMultiSelectComponent {
  @Input() multiSelectOptions: SelectItem[] = [];
  @Output() fetchSelectedOptions = new EventEmitter<string[]>();
  @Input() disabled: boolean = false;
  selectedOption: any;
  public onSelectionChange(event) {
      this.fetchSelectedOptions.emit(event.value);
  }
}
