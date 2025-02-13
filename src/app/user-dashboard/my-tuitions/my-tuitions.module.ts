import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTuitionsComponent } from './my-tuitions.component';
import { LessonRequestsComponent } from './lesson-requests/lesson-requests.component';
import { ActiveTuitionsComponent } from './active-tuitions/active-tuitions.component';
import { PreviousTuitionsComponent } from './previous-tuitions/previous-tuitions.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import {MatPaginator} from "@angular/material/paginator";
import {HttpClientModule} from "@angular/common/http";
import {AvailabilityService} from "../../lessons/availability.service";
import {MatButton} from "@angular/material/button";
import {ProfileLessonRequestsDialogComponent} from "./profile-lesson-requests-dialgoue.component";
import {MatDialogActions, MatDialogContent} from "@angular/material/dialog";
import {MatList, MatListItem} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {TuitionSummaryComponent} from "./tuition-summary.component";
import {RouterLink} from "@angular/router";
import {FullCalendarModule} from "@fullcalendar/angular";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    MyTuitionsComponent,
    LessonRequestsComponent,
    ActiveTuitionsComponent,
    PreviousTuitionsComponent,
    ProfileLessonRequestsDialogComponent,
    TuitionSummaryComponent
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatPaginator,
    MatButton,
    MatDialogContent,
    MatList,
    MatListItem,
    MatDialogActions,
    MatIcon,
    MatProgressSpinner,
    RouterLink,
    FullCalendarModule,
    MatCheckbox,
    FormsModule
  ],
  providers:[AvailabilityService],
  exports: [MyTuitionsComponent,ProfileLessonRequestsDialogComponent]
})
export class MyTuitionsModule {}
