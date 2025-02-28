import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AvailabilityService} from "../../../lessons/availability.service";
import {AuthenticatedUser} from "../../../authentication/authenticated-user.class";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {CalendarOptions} from "@fullcalendar/core";
import {FullCalendarComponent} from "@fullcalendar/angular";
import {ProfileService} from "../../../profiles/profile.service";
import {TutorProfile} from "../../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../../profiles/interfaces/student.model";
import {MatDialog} from "@angular/material/dialog";
import {LessonSummaryDialogComponent} from "./lesson-summary/lesson-summary-dialgoue.component";
import {LessonSummary} from "./lesson-summary/lesson-summary.model";
import { TuitionsService } from '../tuitions.service';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-tuition-summary',
  templateUrl: './tuition-summary.component.html',
  styleUrls: ['./tuition-summary.component.scss']
})
export class TuitionSummaryComponent implements OnInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  calendarOptions!: CalendarOptions;
  availabilitySlots: any[] = []
  isTimeGridView = false;
  profileId!: number;
  tuitionSummary: any;

  userProfile!: TutorProfile | StudentProfile;
  profile!: TutorProfile | StudentProfile;
  loading: boolean = true;

  tuitionDetails = {
    startDate: null,
  };


  constructor(private route: ActivatedRoute,
              private availabilityService: AvailabilityService,
              private profileService: ProfileService,
              private router: Router,
              private dialog:MatDialog,
              private tuitionsService: TuitionsService,
              private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.profileId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchTuitionSummary();
    this.fetchProfiles();
  }

  //this needs generalised for both profile types i.e args need switch

  fetchTuitionSummary() {
    this.availabilityService.getTuitionSummary(this.profileId, AuthenticatedUser.getAuthUserProfileId()).subscribe(response => {
      this.tuitionSummary = response;
      this.tuitionDetails.startDate = this.tuitionSummary.startDate;

      this.initializeCalendar();
      this.fetchLessons(new Date());

      this.loading = false;
    });
  }

  private initializeCalendar(): void {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      selectable: true,
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      height: 'auto',
      contentHeight: 600,
      slotMinTime: "06:00:00", // Start time of the day (Adjust based on business hours)
      slotMaxTime: "23:00:00", // End time
      slotDuration: "00:15:00", // Smaller slots allow finer adjustments
      expandRows: true, // Ensures row height expands for long slots
      events: [],
      dateClick: this.onDateClick.bind(this),
      datesSet: this.onMonthChange.bind(this),
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      }
    }
  }

  private fetchLessons(date: Date): void {
    if (!this.profile?.id) return;
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

    this.availabilityService.getTuitionLessonSummary(this.tuitionSummary.id, start, end)
      .subscribe(response => {
        this.availabilitySlots = response.map((lesson: LessonSummary) => lesson);
        this.updateCalendarEvents();
      });
  }


  private updateCalendarEvents(): void {
    this.calendarOptions.events = this.availabilitySlots.map((lesson: LessonSummary) => ({
      title: lesson.lessonStatus,
      start: lesson.availabilityDto.startTime,
      end: lesson.availabilityDto.endTime,
      extendedProps: { lesson },
      color: this.getEventColor(lesson.lessonStatus)
    }));

    this.calendarOptions.eventClick = this.onLessonClick.bind(this);
  }

  onLessonClick(info: any): void {
    const lesson: LessonSummary = info.event.extendedProps.lesson;


    const dialogRef = this.dialog.open(LessonSummaryDialogComponent, {
      data: { lesson }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'cancelled') {
        this.fetchLessons(new Date());
      }
    });
  }

  private getEventColor(lessonStatus: string): string {
    switch (lessonStatus.toUpperCase()) {
      case 'CONFIRMED': return '#4CAF50';
      case 'COMPLETED': return '#9E9E9E';
      case 'CANCELLED': return '#FF0000';
      default: return '#000000';
    }
  }
  /** 🔹 Switch to TimeGrid Day View */
  onDateClick(info: any): void {
    console.log('Clicked date:', info.dateStr);
    if (this.calendarComponent?.getApi()) {
      this.calendarComponent.getApi().changeView('timeGridDay', info.dateStr);
      this.isTimeGridView = true;
    }
  }

  /** 🔹 Switch Back to Month View */
  switchToMonthView(): void {
    console.log('Switching back to Month View...');
    if (this.calendarComponent?.getApi()) {
      this.calendarComponent.getApi().changeView('dayGridMonth');
      this.isTimeGridView = false;
    }
  }

  onMonthChange(info: any): void {
    const newDate = info.start;
    this.fetchLessons(newDate);
  }

  goBackToTuitions() {
    this.router.navigate(['/user-dashboard/my-tuitions'], { queryParams: { tab: 1 } });
  }


  fetchProfiles() {
    this.profileService.getProfileById(AuthenticatedUser.getAuthUserProfileId()).subscribe(profile => {
      console.log('Current user Profile:', profile);
      this.userProfile = profile;
    });

    this.profileService.getProfileById(this.profileId).subscribe(profile => {
      console.log('Tuition Profile:', profile);
      this.profile = profile;
    });
  }

  deactivateTuition(): void {
    const confirmed = window.confirm('Are you sure you want to deactivate this tuition?');

    if (!confirmed) {
      return;
    }

    this.tuitionsService.deactivateTuition(this.tuitionSummary.id).subscribe({
      next: () => {
        this.snackBar.open('Tuition successfully deactivated.', 'OK', { duration: 3000 }); // ✅ Success message
      },
      error: (err) => {
        console.error('Failed to deactivate tuition:', err);
        this.snackBar.open('Error deactivating tuition. Please try again.', 'Close', { duration: 4000 });
      }
    });
  }
}
