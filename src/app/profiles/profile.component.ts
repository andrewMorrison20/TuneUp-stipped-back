import {Component, OnInit, ViewChild, AfterViewInit, HostListener} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from './profile.service';
import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import {MatDialog} from "@angular/material/dialog";
import {LessonRequestDialogComponent} from "../lessons/lesson-request/lesson-request-dialog.component";
import {AuthenticatedUser} from "../authentication/authenticated-user.class";
import {AvailabilityService} from "../lessons/availability.service";
import {ChatDialogueComponent} from "../user-dashboard/chats/chat-dialogue.component";

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  profile: Profile | null = null;
  isTimeGridView = false;
  calendarOptions!: CalendarOptions;
  availabilitySlots: any[] = []
  isOwnProfile = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private availabilityService: AvailabilityService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeCalendar();
    this.route.paramMap.subscribe(params => {
      const profileId = params.get('id');
      if (profileId) {
        this.fetchProfile(Number(profileId));
        this.isOwnProfile = (AuthenticatedUser.getAuthUserProfileId() === +profileId)
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.calendarComponent) {
      console.error('FullCalendar reference not found.');
    }
  }

  private initializeCalendar(): void {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      selectable: true,
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      height: 'auto',
      contentHeight: 600,
      slotMinTime: "06:00:00",
      slotMaxTime: "23:00:00",
      slotDuration: "00:30:00",
      expandRows: true,
      events: [],
      eventClick: this.onEventClick.bind(this),
      dateClick: this.onDateClick.bind(this),
      datesSet: this.onMonthChange.bind(this),
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      },
      displayEventEnd: true,
      eventDidMount: (info) => {
        const status = info.event.extendedProps['status'];
        const timeEl = info.el.querySelector('.fc-event-time');
        if (timeEl && timeEl instanceof HTMLElement) {
          if (status === 'BOOKED') {
            timeEl.style.color = 'grey';
          } else {
            timeEl.style.color = 'inherit';
          }
        }
      }
    };
  }

  private fetchProfile(profileId: number): void {
    this.profileService.getProfileById(profileId).subscribe({
      next: profile => {
        this.profile = profile;
        console.log('Profile loaded:', profile);

        // Fetch reviews for the profile
        this.profileService.getProfileReviews(profile.id).subscribe({
          next: reviews => {
            this.profile!.reviews = reviews;
            console.log('Resolved reviews:', reviews);
          },
          error: err => {
            console.error('Error fetching reviews:', err);
          }
        });

        // Fetch qualifications and availability
        this.fetchProfileQualifications();
        this.fetchAvailability(new Date());
      },
      error: err => {
        console.error('Error fetching profile:', err);
      }
    });
  }

  private fetchAvailability(date: Date): void {
    if (!this.profile?.id) return;
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const end = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}T23:59:59.999`;

    this.availabilityService.getPeriodAvailabilityForProfile(this.profile.id, start, end)
      .subscribe(slots => {
        this.availabilitySlots = slots;
        this.updateCalendarEvents();
      });
  }

  private onMonthChange(info: any): void {
    if (!this.calendarComponent || !this.calendarComponent.getApi) {
      console.warn(' calendarComponent not initialized yet.');
      return;
    }

    const currentDate = this.calendarComponent.getApi().getDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0).toISOString();

    console.log(`Fetching for month: ${start} to ${end}`);
    this.fetchAvailability(new Date(start));
  }

  onDateClick(info: any): void {
    console.log('Clicked date:', info.dateStr);
    if (this.calendarComponent?.getApi()) {
      this.calendarComponent.getApi().changeView('timeGridDay', info.dateStr);
      this.isTimeGridView = true;
    }
  }

  switchToMonthView(): void {
    console.log('Switching back to Month View...');
    if (this.calendarComponent?.getApi()) {
      this.calendarComponent.getApi().changeView('dayGridMonth');
      this.isTimeGridView = false;
    }
  }

  onEventClick(info: any): void {
    console.log('Event clicked:', info.event.title);

    const availabilityId = info.event.extendedProps.availabilityId;
    console.log(this.profile?.profileType)
    console.log(AuthenticatedUser.getAuthUserProfileType())
    if (!availabilityId) {
      console.error("No availability ID found!");
      return;
    }  // Ensure only students can send lesson requests
    if (this.profile?.profileType === 'Student' || AuthenticatedUser.getAuthUserProfileType()!== 'STUDENT') {
      console.warn("Only students can send lesson requests.");
      return;
    }
    const dialogRef = this.dialog.open(LessonRequestDialogComponent, {
      width: '400px',
      data: {
        title: info.event.title,
        startTime: info.event.start.toISOString(),
        endTime: info.event.end?.toISOString(),
        profileId: this.profile?.id,
        availabilityId:availabilityId,
        status: info.event.title,
        instruments :this.profile?.instruments,
        lessonType: this.profile?.lessonType
      }
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result=== true) {
        this.fetchAvailability(this.calendarComponent.getApi().getDate());
      }
    });
  }

  isTutorProfile(profile: Profile): profile is TutorProfile {
    return profile.profileType === 'Tutor';
  }

  isPricesMapNotEmpty(): boolean {
    return this.isTutorProfile(this.profile!) && (this.profile as TutorProfile).prices.length > 0;
  }


  goBackToResults(): void {
    this.router.navigate(['/profiles/search']);
  }

  startChat(): void {
    console.log('Starting chat with', this.profile?.displayName);
    this.openChatDialog();
  }

  private updateCalendarEvents(): void {
    this.calendarOptions.events = this.availabilitySlots.map(slot => ({
      title: '',
      start: slot.startTime,
      end: slot.endTime,
      extendedProps: { availabilityId: slot.id, status:slot.status},
      color: this.getEventColor(slot.status)
    }));
  }

  private getEventColor(status: string): string {
    switch (status) {
      case 'AVAILABLE': return '#4CAF50'; // Green
      case 'PENDING': return '#9E9E9E';   // Grey
      case 'BOOKED': return '#FF0000';    // Red
      default: return '#000000';          // Fallback Black
    }
  }

  openChatDialog(): void {
    const dialogRef = this.dialog.open(ChatDialogueComponent, {
      width: '800px',
      data: {
        conversation: null,
        participantId: this.profile?.id,
        userProfileId: AuthenticatedUser.getAuthUserProfileId(),
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Chat dialog closed.');
    });
  }

  private fetchProfileQualifications(): void {
    const currentProfile = this.profile;
    if (currentProfile) {
      this.profileService.getProfileQualificationsById(currentProfile.id)
        .subscribe({
          next: (results) => {
            console.log('results are',results)
            currentProfile.instrumentQuals = results;
          },
          error: (err) => {
            console.error('Error fetching profile qualifications:', err);
          }
        });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.calendarComponent) {
      if (window.innerWidth < 768 && !this.isTimeGridView) {
        const today = new Date().toISOString().split('T')[0];
        this.onDateClick({ dateStr: today });
      } else if (window.innerWidth >= 768 && this.isTimeGridView) {
        this.switchToMonthView();
      }
    }
  }

}
