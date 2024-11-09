import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {HomeComponent} from "./home.component";
import {HomeRoutingModule} from "./home-routing.module";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatFormField} from "@angular/material/form-field";
import {MatAnchor, MatButton, MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatNavList} from "@angular/material/list";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    HomeRoutingModule,
    MatSlideToggle,
    MatToolbar,
    MatIcon,
    MatFormField,
    MatAnchor,
    MatButton,
    MatInput,
    MatIconButton,
    MatNavList,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  exports:[HomeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class HomeModule {}