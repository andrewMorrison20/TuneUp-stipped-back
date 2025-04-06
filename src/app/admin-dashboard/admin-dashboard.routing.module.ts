import {RouterModule, Routes} from "@angular/router";
import {UserDashboardComponent} from "../user-dashboard/user-dashboard.component";
import {UpdateProfileComponent} from "../user-dashboard/update-profile/update-profile.component";
import {MyTuitionsComponent} from "../user-dashboard/my-tuitions/my-tuitions.component";
import {StudyHubComponent} from "../user-dashboard/study-hub/study-hub.component";
import {authGuard} from "../authentication/guards/auth-guard";
import {NgModule} from "@angular/core";
import {AdminDashboardComponent} from "./admin-dashboard.component";
import {UsersComponent} from "./users/users.component";

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent, // Layout Component
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'search', component: MyTuitionsComponent },
      { path: 'chats', component: StudyHubComponent },
      { path: 'requests', component: StudyHubComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' } // Default route
    ],canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDashboardRoutingModule {}
