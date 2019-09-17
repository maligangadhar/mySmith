import { Injectable, Inject } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Adal4Service } from '@corsys/corsys-adal';
import { ICommonService } from './interfaces/interfaces';
import { ENV_APP_MAP } from './config/appMap/appMap';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private adalSvc: Adal4Service, private router: Router,
    @Inject('ICommonService') private commonService: ICommonService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.adalSvc.userInfo.authenticated) {
      return this.checkRole(route);
    } else {
      this.adalSvc.login();
      return false;
    }
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(childRoute, state);
  }

  checkRole(route: ActivatedRouteSnapshot): boolean {
    if (route.routeConfig) {
      if (this.commonService.UserAccess &&
        this.commonService.UserAccess.role &&
        this.commonService.UserAccess.role.apps &&
        (this.validateRelationship(route) ||
          this.commonService.UserAccess.role.apps.find(app => app.code.toLowerCase() === route.routeConfig.path.toLowerCase()))) {
        return true;
      }
      else {
        this.router.navigate([ENV_APP_MAP.unauthorized]);
      }
    }
    return false;
  }

  validateRelationship(route: ActivatedRouteSnapshot): boolean {
    if (this.commonService.UserAccess.role.apps.some(app => [ENV_APP_MAP.inspection, ENV_APP_MAP.scanner].indexOf(app.code) >= 0)) {
      if (route.params.scanToOpen || route.params.case) {
        return true;
      }
    }
    else {
      return false;
    }
  }
}
