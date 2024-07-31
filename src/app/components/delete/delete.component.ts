import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
  imports: [MatButtonModule],
  templateUrl: './delete.component.html',
})
export class DelteteComponen {
  constructor(
    public dialogRef: MatDialogRef<DelteteComponen, DeleteDialogData>, // Update type to DeleteDialogData
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.dialogRef.close(this.data);
    console.log(this.data);
  }
}
