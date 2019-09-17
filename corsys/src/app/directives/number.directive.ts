import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[myNumberOnly]'
})

export class NumberOnlyDirective {
  constructor(private el: ElementRef) {}
  @Input() regexKey: string;
  @Input() minValue: number = 0;
  @Input() maxValue: number = 0;
  getParentBySelector = (currentElem: any, elem: string, className: string) => {
      var nodeName: string = currentElem.nodeName;
      var targetedNode = currentElem;
      if (elem === nodeName.toLocaleLowerCase() && currentElem.classList.contains(className)) {
        return targetedNode;
      }
      var parentNode = currentElem.parentNode;
      return this.getParentBySelector(parentNode, elem, className);
  }
  @HostListener('keyup', [ '$event' ])
  onKeyDown(event: KeyboardEvent) {
      var test = new RegExp(this.regexKey, 'g');
      let current: string = this.el.nativeElement.value;
      var elem = this.getParentBySelector(this.el.nativeElement, 'div', 'form-group');
      if (!current || !String(current).match(test) || (+current < +this.minValue || +current > +this.maxValue)) {
          elem.classList.add('has-error');
      } else {
          elem.classList.remove('has-error');
      }
  }

  @HostListener('paste', ['$event']) onPaste(event: MouseEvent) {
    event.preventDefault();
  }
}
