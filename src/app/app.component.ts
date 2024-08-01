import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeService } from './services/employee.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './components/dialog/dialog.component';
import { DelteteComponen } from './components/delete/delete.component';
import { ChangeDetectorRef } from '@angular/core';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

// Define the Employee interface
export interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  fullname?: string;
}

// Define the structure of the API response
export interface EmployeeResponse {
  data: Array<{
    id: number;
    attributes: {
      firstname?: string;
      lastname?: string;
      email?: string;
    }
  }>;
  meta: {
    pagination: {
      total: number;
    }
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    DialogComponent,
    DelteteComponen
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Table';
  displayedColumns: string[] = ['fullname', 'email', 'city', 'actions'];
  dataSource = new MatTableDataSource<Employee>();
  Length = 0;
  isLoadingResults = true;
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    }

    if (this.paginator) {
      merge(this.sort?.sortChange ?? observableOf({}), this.paginator.page)
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoadingResults = true;
            const page = this.paginator.pageIndex + 1;
            const pageSize = this.paginator.pageSize;

            // Determine the sort field and order
            const sortField = this.sort?.active || 'id';  // Default to 'id' if not defined
            const sortOrder = this.sort?.direction || 'asc'; // Default to 'asc' if not defined

            return this.employeeService.filter(this.searchTerm, page, pageSize, sortField, sortOrder)
              .pipe(catchError(() => observableOf({ data: [], meta: { pagination: { total: 0 } } })));
          }),
          map(response => {
            this.isLoadingResults = false;
            this.Length = response.meta.pagination.total;

            const employees: Employee[] = response.data.map(item => ({
              id: item.id,
              firstname: item.attributes.firstname || '',
              lastname: item.attributes.lastname || '',
              email: item.attributes.email || '',
              fullname: `${item.attributes.firstname || ''} ${item.attributes.lastname || ''}`  // Combine fullname
            }));

            return employees;
          })
        )
        .subscribe(data => {
          this.dataSource.data = data;
          this.cdr.detectChanges();
        });
    }
  }

  applyFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.paginator.pageIndex = 0; // Reset to the first page
    this.loadData();
  }

  delete(employee: Employee) {
    const dialogRef = this.dialog.open(DelteteComponen, {
      data: employee
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employeeService.delete(result).subscribe({
          next: () => this.loadData(),
          error: err => console.error('Delete failed', err)
        });
      }
    });
  }

  opendialog(employee?: Employee): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: employee,
    });

    dialogRef.componentInstance.employeeSaved.subscribe(result => {
      this.updateTable(result);
    });

    dialogRef.componentInstance.employeeSaved.subscribe(() => {
      this.loadData(); // Refresh data when employee is saved
    });
    dialogRef.afterClosed().subscribe(() => {

    });
  }

  updateTable(updatedEmployee: Employee): void {
    const data = this.dataSource.data.slice();
    const index = data.findIndex(emp => emp.id === updatedEmployee.id);

    if (index !== -1) {
      data[index] = updatedEmployee;
    } else {
      data.push(updatedEmployee);
    }

    this.dataSource.data = data;
  }

  loadData(): void {
    const page = this.paginator.pageIndex + 1;
    const pageSize = this.paginator.pageSize;
    const sortField = this.sort.active || 'id';
    const sortOrder = this.sort.direction || 'asc';

    this.employeeService.filter(this.searchTerm, page, pageSize, sortField, sortOrder).subscribe(response => {
      console.log('API Response:', response);

      const employees: Employee[] = response.data.map(item => ({
        id: item.id,
        firstname: item.attributes.firstname || '',
        lastname: item.attributes.lastname || '',
        email: item.attributes.email || '',
        fullname: `${item.attributes.firstname || ''} ${item.attributes.lastname || ''}`
      }));

      this.dataSource.data = employees;
      this.Length = response.meta.pagination.total;
      this.cdr.detectChanges();
    });
  }
}
