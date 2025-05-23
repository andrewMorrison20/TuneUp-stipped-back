import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage='';
  successMessage='';
  isLoading = false;
  private baseUrl = environment.apiUrl;

  constructor(private fb: FormBuilder,private http: HttpClient,private router: Router) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      name: ['', Validators.required],
      accountType: ['', Validators.required],
    });
  }
  onSignup() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.signupForm.valid) {
      const formData = this.signupForm.value;

      if (formData.password !== formData.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }

      this.isLoading = true;

      const apiUrl = `${this.baseUrl}/users/createNew?profileType=${formData.accountType.toUpperCase()}`;

      this.http.post(apiUrl, {
        email: formData.email,
        name: formData.name,
        password: formData.password
      }).subscribe({
        next: response => {
          this.isLoading = false;
          this.successMessage = 'Signup successful! Please check your email to verify your account.';
          console.log('User Creation Successful', response);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000); // Redirect after 2 seconds
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          if (error.status === 400) {
            this.errorMessage = 'Email already exist. Please check your details.';
          } else if (error.status === 409) {
            this.errorMessage = 'Email already exists. Please use a different email.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
          }
          console.error('Signup failed', error);
        }
      });
    }
  }

    }
