import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EmployeeService } from './services/employee.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './components/dialog/dialog.component';
import { DelteteComponen } from './components/delete/delete.component';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectorRef } from '@angular/core';

// Define the Employee interface
export interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatPaginatorModule,
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    DialogComponent,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Table';
  displayedColumns: string[] = ['fullName', 'email', 'actions'];
  dataSource = new MatTableDataSource<Employee>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    this.dataSource.paginator! = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadEmployees(); // Load initial data
    this.paginator.page.subscribe(() => this.loadEmployees()); // Load data on page change
  }


  loadEmployees(): void {
    const page = this.paginator.pageIndex + 1; // Adjust for zero-based index
    const pageSize = this.paginator.pageSize;
    console.log(`Fetching page ${page} with page size ${pageSize}`);

    this.employeeService.getPaginatedData(page, pageSize).subscribe(response => {
      console.log('API Response:', response);

      const employees: Employee[] = response.data.map((item) => ({
        id: item.id,
        firstname: item.attributes.firstname || '',
        lastname: item.attributes.lastname || '',
        email: item.attributes.email || ''
      }));

      this.dataSource.data = employees;
      this.paginator.length = response.meta.pagination.total;
      this.cdr.detectChanges();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  delete(element: Employee) {
    const dialogRef = this.dialog.open(DelteteComponen, {
      data: element
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employeeService.delete(result).subscribe({
          next: () => {
            this.loadEmployees(); // Reload employees after deletion
          },
          error: err => {
            console.error('Delete failed', err);
          }
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

    dialogRef.afterClosed().subscribe(() => {
      // Optionally handle after dialog is closed
    });
  }

  updateTable(updatedEmployee: Employee): void {
    const data = this.dataSource.data.slice(); // Create a copy of the data array
    const index = data.findIndex(emp => emp.id === updatedEmployee.id);

    if (index !== -1) {
      // Update existing employee
      data[index] = updatedEmployee;
    } else {
      // Add new employee if it does not exist
      data.push(updatedEmployee);
    }

    // Update the dataSource with the new data
    this.dataSource.data = data;
  }
}
