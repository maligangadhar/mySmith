import { Component } from '@angular/core';
import { SecureService } from '../../services/secure.adal.service';
@Component({
  selector: 'sp3-comp-modal-timeout',
	templateUrl: './modal.session.timeout.component.html'
})

export class ModalTimeoutComponent  {
  public visible = false;
  public visibleAnimate = false;
  constructor(private secureService:SecureService){}
  public show(): void {       
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true);
  }
  public navigateToLogin(){
    this.secureService.logOut();
  }
}




