import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TuitionsService } from '../my-tuitions/tuitions.service';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';
import {tap, catchError, take} from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { TutorProfile } from '../../profiles/interfaces/tutor.model';
import { StudentProfile } from '../../profiles/interfaces/student.model';
import { LessonSummary } from '../my-tuitions/tuition-summary/lesson-summary/lesson-summary.model';
import {PaymentsService} from "./payments.service";

interface Payment {
  id?: any;
  displayName?: string;
  lessonDate: string;
  tuitionId:number,
  amount: string;
  status?: 'Due' | 'Paid' | 'Overdue';
  dueDate: string;
  paidOn?: string;
  invoiceUrl?: string;
}

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  paymentForm: FormGroup;
  statuses = ['All', 'Due', 'Paid', 'Overdue'];
  selectedStatus = 'All';
  payments: Payment[] = [];
  displayedColumns: string[] = ['select', 'displayName', 'lessonDate', 'amount', 'status', 'dueDate', 'actions'];
  dataSource = new MatTableDataSource<Payment>(this.payments);
  profiles: Profile[] = [];
  lessons:LessonSummary[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;
  selectedPayments: Payment[] = [];
  selectedFileName: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private dialog: MatDialog, private tuitionsService: TuitionsService, private paymentsService: PaymentsService) {
    this.paymentForm = this.fb.group({
      tuition: ['', Validators.required],
      lesson: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      invoice: [null, [this.fileValidator]],
      dueDate: ['', [Validators.required, this.futureDateValidator]],
      tuitionId:['',[Validators.required, Validators.min(1)]],
      lessonDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchPayments();
    this.fetchTuitions();
  }

  futureDateValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today ? null : { pastDate: true };
  }

  onLessonChange(lessonId: number): void {
    const selectedLesson = this.lessons.find(lesson => lesson.id === lessonId);

    if (selectedLesson) {
      this.paymentForm.patchValue({
        tuitionId: selectedLesson.tuitionId,
        lessonDate: selectedLesson.availabilityDto.startTime
      });
    }

    console.log('Lesson Date:', this.paymentForm.get('lessonDate')?.value);
    console.log('TUITION ID:', this.paymentForm.get('tuitionId')?.value);
  }


  fileValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const file = control.value;

    if (!allowedTypes.includes(file.type)) {
      return { invalidFileType: true };
    }

    if (file.size > maxSize) {
      return { fileTooLarge: true };
    }

    return null;
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) return;

    const paymentData: Payment = {
      amount: this.paymentForm.value.amount,
      dueDate: this.paymentForm.value.dueDate,
      lessonDate: this.paymentForm.value.lesson,
      tuitionId: this.paymentForm.value.tuitionId
    };

    const invoiceFile = this.paymentForm.value.invoice;

    if (invoiceFile) {
      // Upload invoice first since we need url for payment creation
      this.paymentsService.uploadInvoice(invoiceFile)
        .pipe(take(1))
        .subscribe({
          next: (invoiceUrl) => {
            paymentData.invoiceUrl = invoiceUrl;

            // Create payment with invoice URL
            this.paymentsService.createPayment(paymentData)
              .pipe(take(1))
              .subscribe({
                next: () => {
                  console.log('Payment created with invoice');
                  this.fetchPayments();
                },
                error: (err) => console.error('Error creating payment:', err)
              });
          },
          error: (err) => console.error('Invoice upload failed:', err)
        });
    } else {
      // No invoice, create payment directly
      this.paymentsService.createPayment(paymentData)
        .pipe(take(1))
        .subscribe({
          next: () => {
            console.log('Payment created without invoice');
            this.fetchPayments();
          },
          error: (err) => console.error('Error creating payment:', err)
        });
    }
  }

  toggleRow(payment: Payment): void {
    const index = this.selectedPayments.findIndex(p => p.id === payment.id);
    if (index > -1) {
      this.selectedPayments.splice(index, 1);
    } else {
      this.selectedPayments.push(payment);
    }
  }

  removeSelectedFile(fileInput: HTMLInputElement): void {
    this.paymentForm.patchValue({ invoice: null });
    this.paymentForm.get('invoice')?.updateValueAndValidity();
    this.paymentForm.patchValue({ invoice: null });
    this.selectedFileName = null;
    fileInput.value = '';
  }

  toggleAllRows(): void {
    if (this.selectedPayments.length === this.payments.length) {
      this.selectedPayments = [];
    } else {
      this.selectedPayments = [...this.payments];
    }
  }

  markAsPaid(): void {
    if (!this.selectedPayments.length) return;

    const paymentIds = this.selectedPayments.map(p => p.id);
    this.paymentsService.markPaymentsAsPaid(paymentIds)
      .pipe(take(1))
      .subscribe(() => {
        console.log('Payments marked as paid');
        this.fetchPayments();
      });
  }

  fetchPayments(): void {
    this.paymentsService.getPayments(AuthenticatedUser.getAuthUserProfileId())
      .pipe(take(1))
      .subscribe((payments: Payment[]) => {
        this.payments = payments.map(payment => ({
          ...payment,
          displayName: payment.displayName ?? 'Unknown'
        }));

        console.log('Processed Payments:', this.payments);
        this.dataSource.data = this.payments;
        this.dataSource._updateChangeSubscription();
      });
  }




  applyFilter(): void {
    if (this.selectedStatus === 'All') {
      this.dataSource.data = this.payments;
    } else {
      this.dataSource.data = this.payments.filter(p => p.status === this.selectedStatus);
    }
  }


  viewInvoice(payment: Payment): void {
    this.dialog.open(InvoiceDialogComponent, {
      data: { payment }
    });
  }

  sendReminder(payment: Payment): void {
    console.log('Sending reminder for:', payment);
  }

  fetchTuitions() {
    this.isLoading = true;
    const profileId = AuthenticatedUser.getAuthUserProfileId();
    this.tuitionsService.fetchTuitions(profileId, true)
      .pipe(
        tap(response => {
          this.profiles = response.content;
          this.isLoading = false;
        }),
        catchError(error => {
          console.error('Error fetching profiles:', error);
          this.isLoading = false;
          return EMPTY;
        })
      )
      .subscribe();
  }

  fetchLessons(profileId: number) {
    this.isLoading = true;
    let studentId = AuthenticatedUser.getAuthUserProfileType() === 'Tutor' ? profileId : AuthenticatedUser.getAuthUserProfileId();
    let tutorId = AuthenticatedUser.getAuthUserProfileType() === 'Tutor' ? AuthenticatedUser.getAuthUserProfileId() : profileId;

    this.tuitionsService.fetchTuitionLessons(studentId, tutorId)
      .pipe(
        tap(lessons => {
          this.lessons = lessons;
          this.isLoading = false;
        }),
        catchError(error => {
          console.error('Error fetching lessons:', error);
          this.isLoading = false;
          return EMPTY;
        })
      )
      .subscribe();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.paymentForm.patchValue({ invoice: file });
      this.paymentForm.get('invoice')?.updateValueAndValidity();
      this.selectedFileName = file.name;
    }
  }

}

@Component({
  selector: 'app-invoice-dialog',
  template: `
    <h1 mat-dialog-title>Invoice</h1>
    <div mat-dialog-content>
      <p>Invoice details for {{data.payment.displayName}}</p>
      <p>Amount: {{data.payment.amount}}</p>
      <p>Status: {{data.payment.status}}</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `
})
export class InvoiceDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { payment: Payment }) {}
}
