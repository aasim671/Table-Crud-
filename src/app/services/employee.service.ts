import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

export interface EmployeeResponse {
  data: {
    id: number;
    attributes: {
      firstname?: string;
      lastname?: string;
      email?: string;
    };
  }[];
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}


export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:1337/api/products'; // Assuming the correct endpoint

  constructor(private http: HttpClient) { }

  getdata(): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(this.apiUrl);
  }

  // Method to get paginated data
  getPaginatedData(page: number = 1, pageSize: number = 10): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(`${this.apiUrl}?pagination[page]=${page}&pagination[pageSize]=${pageSize}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  update(id: number, employee: Employee): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, employee);
  }
}
