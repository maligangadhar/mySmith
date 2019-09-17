import { Component,Input } from '@angular/core';
@Component({
  selector: 'sp3-comp-effects',
  templateUrl: './effects.control.html'
})

export class SP3EffectsComponent {
 		@Input() public title: string;
}
