import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiTestService {
  constructor(private http: HttpClient) {}

  async testBackendEndpoints() {
    console.log('🧪 Testing backend endpoints...');
    
    const endpoints = [
      environment.apiUrl + '/Auth/signup',
      environment.apiUrl + '/auth/signup',
      environment.apiUrl + '/authentication/signup',
      environment.apiUrl + '/account/signup',
      environment.apiUrl + '/Auth/register',
      environment.apiUrl + '/auth/register',
    ];

    const results = await Promise.all(
      endpoints.map(endpoint =>
        this.http.post(endpoint, {}, { 
          responseType: 'text',
          observe: 'response' 
        })
          .pipe(
            timeout(2000),
            catchError(err => {
              console.log(`  ${endpoint}: ${err?.status || 'Error'}`);
              return of({ status: err?.status, endpoint });
            })
          )
          .toPromise()
      )
    );

    console.log('🧪 Test results:', results);
    return results;
  }

  async testBackendConnectivity() {
    try {
      const response = await this.http.get(environment.apiUrl + '/Auth/login', {
        responseType: 'text'
      }).pipe(
        timeout(2000),
        catchError(err => of(null))
      ).toPromise();
      
      // If we get here without error, backend is reachable
      console.log('✅ Backend is reachable');
      return true;
    } catch (err) {
      console.error('❌ Backend connection failed:', err);
      return false;
    }
  }
}
