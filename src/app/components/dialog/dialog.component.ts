import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  @Output() employeeSaved = new EventEmitter<Employee>();

  employeeObj: Employee;

  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Employee,
    private http: HttpClient
  ) {
    this.employeeObj = data ? { ...data } : {
      id: 0,
      firstname: '',
      lastname: '',
      email: '',
    };
  }

  onsave(): void {
    const url = this.employeeObj.id
      ? `http://localhost:1337/api/products/${this.employeeObj.id}`
      : 'http://localhost:1337/api/products';

    const request = this.employeeObj.id
      ? this.http.put(url, { data: this.employeeObj })
      : this.http.post(url, { data: this.employeeObj });

    request.pipe(
      catchError(err => {
        console.error('Save failed', err);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        // Emit event to notify about the saved employee
        this.employeeSaved.emit(this.employeeObj);
        this.dialogRef.close();
      }
    });
  }

  oncancel(): void {
    this.dialogRef.close();
  }
}
