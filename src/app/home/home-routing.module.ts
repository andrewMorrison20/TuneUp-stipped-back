// home/home-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatFormField} from "@angular/material/form-field";
import {MatAnchor, MatButton, MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {ContactUsComponent} from "./contact-us/contact-us.component";

const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home Page' },
  { path: 'contact', component: ContactUsComponent, title: 'Contact us' }
];

@NgModule({
  imports: [RouterModule.forChild(routes),MatToolbar,
    MatIcon,
    MatFormField,
    MatAnchor,
    MatButton,
    MatInput,
    MatIconButton],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
