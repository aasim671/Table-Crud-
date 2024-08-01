import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

export interface EmployeeResponse {
  data: {
    id: number;
    attributes: {
      firstname: string;
      lastname: string;
      email: string;
      fullname: string;  // Ensure the response includes fullname
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
  firstname: string;
  lastname: string;
  email: string;
  fullname?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:1337/api/products';

  constructor(private http: HttpClient) { }

  getdata(page: number = 1, pageSize: number = 5): Observable<EmployeeResponse> {
    const apiUrlWithPagination = `${this.apiUrl}?pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true`;

    return this.http.get<EmployeeResponse>(apiUrlWithPagination);
  }


  getPaginatedData(page: number, pageSize: number): Observable<EmployeeResponse> {
    const params = new HttpParams()
      .set('pagination[page]', page.toString())
      .set('pagination[pageSize]', pageSize.toString());

    return this.http.get<EmployeeResponse>(this.apiUrl, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  update(id: number, employee: Employee): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, employee);
  }

  filter(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 5,
    sortField: string = 'id',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Observable<EmployeeResponse> {
    const encodedSearchTerm = encodeURIComponent(searchTerm);

    // Define the sortable fields and their respective sort directions
    const sortFields = ['firstname', 'lastname', 'email', 'id'];
    const sortParams = sortFields.map(field => `${field}:${sortOrder}`).join(',');

    // Adjust the URL to filter by both firstname and lastname and support multiple sort fields
    const api = `http://localhost:1337/api/products?filters[$or][0][firstname][$containsi]=${encodedSearchTerm}&filters[$or][1][lastname][$containsi]=${encodedSearchTerm}&filters[$or][2][email][$containsi]=${encodedSearchTerm}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true&sort=${sortParams}`;

    return this.http.get<EmployeeResponse>(api);
  }

}
