import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';

import { CommonModule

 } from '@angular/common';

 import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
 import { MatInputModule } from '@angular/material/input';
 import { MatFormFieldModule } from '@angular/material/form-field';
 import { MatCardModule } from '@angular/material/card';
 import { MatButtonModule } from '@angular/material/button';


import { collection, addDoc } from 'firebase/firestore';
import { firestore, pinata } from '../../app.config';
import { Item } from '../../models/item';


@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Admin {
  public itemName = new FormControl('');
  public itemDescription = new FormControl('');
  public itemQuoteAmount = new FormControl(0);
  public itemLocation = new FormControl('');
  public itemImages = new FormControl('');
  public selectedFiles = signal<File[]>([]);

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.selectedFiles.set(Array.from(fileList));
      console.log('selected files:  ', this.selectedFiles());
    }
  }

  newItemForm = new FormGroup({
    itemName: this.itemName,
    itemDescription: this.itemDescription,
    itemQuoteAmount: this.itemQuoteAmount,
    itemLocation: this.itemLocation
  });

  async uploadImages(files: File[]): Promise<string[]> {
    const downloadCIDs: string[] = [];
    for (const file of files) {
      const res = await pinata.upload.public.file(file);
      downloadCIDs.push(res.cid);
    }
    return downloadCIDs;
  }

  async addItem(): Promise<void> {
    if (this.itemName && this.itemDescription && this.itemLocation && this.itemQuoteAmount ) {
      const imageUrls = await this.uploadImages(this.selectedFiles());

      try {
        const formValues = this.newItemForm.value;
        const newItem: Item = {
          id: window.crypto.randomUUID(),
          name: `${ formValues.itemName }`,
          description: `${ formValues.itemDescription }`,
          quote_amount: parseInt(`${ formValues.itemQuoteAmount }`),
          item_images: imageUrls,
          location: `${ formValues.itemLocation }`,
          timestamp: new Date(),
        };
        const docRef = await addDoc(collection(firestore, "bid_items"), newItem);
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    }
  }
}
