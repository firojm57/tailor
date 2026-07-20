import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import { ClothingType } from '../../core/models/models';

@Component({
  selector: 'app-clothing-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clothing-types.html',
  styleUrl: './clothing-types.css'
})
export class ClothingTypesComponent {
  private readonly storageService = inject(StorageService);

  readonly clothingTypes = this.storageService.clothingTypes;

  // UI state signals
  readonly selectedType = signal<ClothingType | null>(null);
  readonly isEditing = signal<boolean>(false);
  readonly isCreating = signal<boolean>(false);

  // Form fields
  typeName = '';
  fields: string[] = [];
  newFieldText = '';

  selectType(type: ClothingType): void {
    this.selectedType.set(type);
    this.isEditing.set(false);
    this.isCreating.set(false);
  }

  startCreate(): void {
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.selectedType.set(null);
    this.typeName = '';
    this.fields = ['Length']; // start with a default field
    this.newFieldText = '';
  }

  startEdit(): void {
    const type = this.selectedType();
    if (!type) return;

    this.isEditing.set(true);
    this.isCreating.set(false);
    this.typeName = type.name;
    this.fields = [...type.fields];
    this.newFieldText = '';
  }

  addField(): void {
    const text = this.newFieldText.trim();
    if (!text) return;
    if (this.fields.some(f => f.toLowerCase() === text.toLowerCase())) {
      alert('Field already exists.');
      return;
    }
    this.fields.push(text);
    this.newFieldText = '';
  }

  removeField(index: number): void {
    if (this.fields.length <= 1) {
      alert('A clothing type must have at least one measurement field.');
      return;
    }
    this.fields.splice(index, 1);
  }

  save(): void {
    const name = this.typeName.trim();
    if (!name) {
      alert('Please enter a clothing type name.');
      return;
    }

    if (this.fields.length === 0) {
      alert('Please add at least one measurement field.');
      return;
    }

    if (this.isCreating()) {
      // Check for duplicate name
      const duplicate = this.clothingTypes().some(
        t => t.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicate) {
        alert('A clothing type with this name already exists.');
        return;
      }

      const newType = this.storageService.addClothingType(name, this.fields);
      this.selectType(newType);
    } else if (this.isEditing()) {
      const type = this.selectedType();
      if (!type) return;

      this.storageService.updateClothingType(type.id, name, this.fields);
      // Reload selected type
      const updated = this.clothingTypes().find(t => t.id === type.id) || null;
      this.selectedType.set(updated);
    }

    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  cancel(): void {
    this.isCreating.set(false);
    this.isEditing.set(false);
    if (!this.selectedType() && this.clothingTypes().length > 0) {
      this.selectedType.set(this.clothingTypes()[0]);
    }
  }

  deleteType(type: ClothingType): void {
    if (confirm(`Are you sure you want to delete "${type.name}"? This will not delete existing measurements, but you won't be able to select it for new ones.`)) {
      this.storageService.deleteClothingType(type.id);
      this.selectedType.set(null);
      this.isEditing.set(false);
      this.isCreating.set(false);
      if (this.clothingTypes().length > 0) {
        this.selectedType.set(this.clothingTypes()[0]);
      }
    }
  }
}
