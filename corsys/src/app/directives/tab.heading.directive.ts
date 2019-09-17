import { Directive, TemplateRef } from '@angular/core';
import { TabDirective } from './tab.directive';

@Directive({ selector: '[sp3-tab-heading]' })
export class TabHeadingDirective {
		constructor(public templateRef: TemplateRef<any>, tab: TabDirective) {
				tab.headingRef = templateRef;
		}
}
