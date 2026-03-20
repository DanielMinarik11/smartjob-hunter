import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JoobleSearchParams {
  keywords: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
}

@Injectable({
  providedIn: 'root',
})
export class JoobleService {
  private apiKey = 'c8a62252-8414-41a3-974b-439df8adc03f';
  private url = `https://jooble.org/api/${this.apiKey}`;

  constructor(private http: HttpClient) {}

  searchJobs(params: JoobleSearchParams): Observable<any> {
    const body: any = {
      keywords: params.keywords,
      location: params.location,
    };

    if (params.salary_min != null) {
      body.salary_min = params.salary_min;
    }

    if (params.salary_max != null) {
      body.salary_max = params.salary_max;
    }

    return this.http.post(this.url, body);
  }
}
