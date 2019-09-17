import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sp3-comp-modal-error',
  templateUrl: './modal.error.page.component.html'
})

export class ModalErrorComponent {
  public visible = false;
  public visibleAnimate = false;
  @Output() OnError = new EventEmitter();

  public show(): void {
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true);
  }

  public retry() {
    this.OnError.emit();
  }

  public hide() {
    this.visible = false;
    setTimeout(() => this.visibleAnimate = false);
  }
}

