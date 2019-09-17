import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class ServiceGuard implements CanActivate {
   //private static USER_PARAM = "userId";
 
   //constructor(private router: Router, private userService: CurrentUserService) {}
 
   public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
   //   const currentUser = this.userService.currentUser;
   //   const paramUser = route.params[WorksheetAccessGuard.USER_PARAM];
   //   if (paramUser && paramUser !== currentUser.id && !currentUser.admin) {
   //       this.router.navigate(["worksheet"]);
   //       return false;
   //   }
      return true;
   }
}
