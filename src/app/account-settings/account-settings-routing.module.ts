// account-settings-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountSettingsComponent } from './account-settings.component';
import {authGuard} from "../authentication/guards/auth-guard";

const routes: Routes = [
  {
    path: '',
    component: AccountSettingsComponent,
    canActivate: [authGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountSettingsRoutingModule {}
