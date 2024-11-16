import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthenticatedUser } from '../authentication/authenticated-user.class';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  jwtHelper: JwtHelperService;
  errorMessage: string = ''; // For displaying error message

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private jwtService: JwtHelperService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.jwtHelper = jwtService;
  }

  ngOnInit(): void {
    this.loginForm.reset();
    this.errorMessage = ''; // Reset error message on init
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
          // Handle success (response contains JWT token)
          const decodedJWT = this.jwtHelper.decodeToken(response.token);
          console.log('Decoded JWT:', decodedJWT);
          this.completeSaveAndNavigate(decodedJWT)
            .then(() => console.log('Navigation complete'))
            .catch((error) => console.error('Navigation error:', error));
        },
        (error: HttpErrorResponse) => {
          // Handle error (e.g., invalid credentials)
          this.handleLoginError(error);
        }
      );
  }

  private async completeSaveAndNavigate(token: any) {
    try {
      const authUserObj = AuthenticatedUser.save(
        'John',
        'user',
        token.access_token,
        token.refresh_token,
        'form'
      );
      console.log('Authenticated User:', authUserObj);

      const navigationSuccess = await this.router.navigate(['/home']);
      console.log('Navigation status:', navigationSuccess);
    } catch (error) {
      console.error('Error during navigation:', error);
    }
  }

  private handleLoginError(error: HttpErrorResponse): void {
    // Reset the form and show appropriate error message
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
