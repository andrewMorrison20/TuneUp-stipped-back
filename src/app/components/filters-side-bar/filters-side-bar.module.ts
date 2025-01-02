import {NgModule} from "@angular/core";
import {FiltersSideBarComponent} from "./filters-side-bar.component";
import {CommonModule} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatExpansionModule } from "@angular/material/expansion";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatSidenavModule} from "@angular/material/sidenav";

@NgModule({
  declarations: [
    FiltersSideBarComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatToolbarModule,
    MatExpansionModule,
    MatSelectModule,
    MatExpansionModule,
    MatSelect,
    MatOption,
  ],
  exports: [FiltersSideBarComponent]
})
export class FiltersSideBarModule { }
