import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sp3-comp-loader',
  template: `<div class="{{loader}}"></div>`
})
export class Sp3LoaderComponent implements OnInit {
  @Input() loader: string;
  @Input() public size: string;

  ngOnInit() {

    this.loader = 'sp sp-circle';
    switch (this.size) {
      case 'medium':
        this.loader = 'sp-medium sp-circle';
        break;
      case 'large':
        break;
    }

  }
}
