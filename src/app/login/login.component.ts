import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthenticatedUser } from '../authentication/authenticated-user.class';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  errorMessage: string = '';
  returnUrl: string = '/'; // Store return URL

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute // Inject ActivatedRoute to get query params
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loginForm.reset();
    this.errorMessage = '';
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home'; // Get return URL from query params
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    const body = { email, password };
    const headers = new HttpHeaders().append('Content-Type', 'application/json');

    this.http.post('http://localhost:8080/auth/login', body, { headers })
      .subscribe(
        (response: any) => {
          console.log('RESPONSE:', response);
          this.completeSaveAndNavigate(response.token)
            .then(() => console.log('Navigation complete'))
            .catch((error) => console.error('Navigation error:', error));
        },
        (error: HttpErrorResponse) => {
          this.handleLoginError(error);
        }
      );
  }

  private async completeSaveAndNavigate(token: string) {
    try {
      const decodedToken = this.decodeJWT(token);

      if (!decodedToken) {
        throw new Error('Invalid JWT token');
      }

      console.log('Decoded JWT:', decodedToken);

      const authUserObj = AuthenticatedUser.save(
        decodedToken.username,
        'user',
        token,
        'form',
        decodedToken.userId, // User ID
        decodedToken.profileId,
        decodedToken.profileType// Profile ID
      );

      console.log('Authenticated User:', authUserObj);

      // Navigate to the original requested page
      await this.router.navigateByUrl(this.returnUrl);
      console.log('Navigation successful:', this.returnUrl);

    } catch (error) {
      console.error('Error during login process:', error);
    }
  }

  private decodeJWT(token: string): any | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  private handleLoginError(error: HttpErrorResponse): void {
    this.loginForm.reset();
    if (error.status === 400) {
      this.errorMessage = 'Invalid email or password.';
    } else if (error.status === 500) {
      this.errorMessage = 'Server error. Please try again later.';
    } else {
      this.errorMessage = 'An unknown error occurred. Please try again.';
    }
    console.error('Login error:', error);
  }

  loginWithGoogle() {
    console.log('Login with Google');
  }

  loginWithFacebook() {
    console.log('Login with Facebook');
  }

  loginWithOutlook() {
    console.log('Login with Outlook');
  }
}

