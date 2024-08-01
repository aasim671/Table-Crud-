import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Define the interface for the data passed to the dialog
export interface DeleteDialogData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css'] // Optional: Add a CSS file if needed
})
export class DelteteComponen {
  constructor(
    public dialogRef: MatDialogRef<DelteteComponen, DeleteDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.dialogRef.close(this.data); // Close with data to indicate deletion
    console.log(this.data); // Log data to verify correct information
  }
}
