import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '../../profiles/profile.service';
import { TutorProfile } from '../../profiles/interfaces/tutor.model';
import { StudentProfile } from '../../profiles/interfaces/student.model';


type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit {
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  displayedColumns: string[] = ['select','name', 'profileType', 'actions'];
  dataSource = new MatTableDataSource<Profile>([]);
  profiles: Profile[] = [];
  isLoading = false;
  selectedProfiles: Profile[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private snackBar: MatSnackBar,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.fetchProfiles();
  }

  ngAfterViewInit(): void {
    // Assign paginator and sort just once.
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fetchProfiles(): void {
    this.isLoading = true;
    this.profileService.getAllProfiles(this.pageIndex, this.pageSize)
      .subscribe({
        next: (response) => {
          // Log the response to verify backend values.
          console.log('Fetched profiles:', response);
          this.profiles = response.profiles;
          this.totalElements = response.totalElements;
          this.dataSource.data = this.profiles;
          // Force update the table (if necessary).
          this.dataSource._updateChangeSubscription();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching profiles:', error);
          this.isLoading = false;
          this.snackBar.open('Error fetching profiles', 'Close', { duration: 3000 });
        }
      });
  }

  onPageChange(event: PageEvent): void {
    // Debug logging for page changes.
    console.log('Page change event:', event);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchProfiles();
  }

  sendMessage(profile: Profile): void {
    console.log('Send message to profile:', profile);
    // Implement your send message logic here.
  }

  viewProfile(profile: Profile): void {
    console.log('View profile:', profile);
    // Implement your view profile logic here.
  }

  confirmDeleteUsers() {

  }

  toggleRow( profile: Profile): void {
    const index = this.selectedProfiles.findIndex(p => p.id === profile.id);
    if (index > -1) {
      this.selectedProfiles.splice(index, 1);
    } else {
      this.selectedProfiles.push(profile);
    }
  }

  toggleAllRows(): void {
    if (this.selectedProfiles.length === this.profiles.length) {
      this.selectedProfiles = [];
    } else {
      this.selectedProfiles = [...this.profiles];
    }
  }

}
