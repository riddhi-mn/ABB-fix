import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DatasetMetadata } from '../../models/dataset-metadata.model';
import { StepIndicatorComponent } from '../shared/step-indicator/step-indicator.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';

@Component({
  selector: 'app-upload-dataset',
  standalone: true,
  imports: [CommonModule, FormsModule, StepIndicatorComponent, NavigationComponent],
  template: `
    <div class="upload-container fade-in">
      <app-step-indicator [currentStep]="1"></app-step-indicator>
      <app-navigation [currentStep]="1"></app-navigation>

      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="card">
            <div class="card-header">
              <h3 class="mb-0">
                <i class="fas fa-upload me-2"></i>
                Upload Dataset
              </h3>
            </div>
            <div class="card-body">
              <!-- Upload Area -->
              <div 
                class="upload-area" 
                [class.dragover]="isDragOver"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                (click)="fileInput.click()"
                *ngIf="!datasetMetadata">
                <div class="upload-icon">
                  <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <h4>Upload Your Dataset</h4>
                <p class="text-muted mb-3">
                  Click to select a CSV file or drag and drop it here
                </p>
                <button type="button" class="btn btn-primary">
                  <i class="fas fa-file-csv me-2"></i>
                  Choose File
                </button>
                <input 
                  #fileInput 
                  type="file" 
                  accept=".csv" 
                  (change)="onFileSelected($event)"
                  style="display: none;">
              </div>

              <!-- Loading State -->
              <div class="text-center" *ngIf="isUploading">
                <div class="spinner mb-3"></div>
                <h4>Processing Dataset...</h4>
                <p class="text-muted">Please wait while we analyze your data</p>
                <div class="progress mt-3">
                  <div class="progress-bar progress-bar-striped progress-bar-animated" 
                       role="progressbar" 
                       style="width: 100%"></div>
                </div>
              </div>

              <!-- Error State -->
              <div class="alert alert-danger" *ngIf="errorMessage">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ errorMessage }}
                <button type="button" class="btn btn-sm btn-outline-danger ms-3" (click)="resetUpload()">
                  Try Again
                </button>
              </div>

              <!-- Success State -->
              <div class="upload-success" *ngIf="datasetMetadata && datasetMetadata.status === 'Success'">
                <div class="alert alert-success">
                  <i class="fas fa-check-circle me-2"></i>
                  Dataset uploaded and processed successfully!
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="info-card">
                      <h5><i class="fas fa-file-csv me-2"></i>File Information</h5>
                      <div class="info-item">
                        <strong>File Name:</strong>
                        <span class="text-primary">{{ datasetMetadata.fileName }}</span>
                      </div>
                      <div class="info-item">
                        <strong>Total Records:</strong>
                        <span class="badge bg-primary">{{ datasetMetadata.totalRecords | number }}</span>
                      </div>
                      <div class="info-item">
                        <strong>Total Columns:</strong>
                        <span class="badge bg-secondary">{{ datasetMetadata.totalColumns }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-card">
                      <h5><i class="fas fa-chart-pie me-2"></i>Quality Metrics</h5>
                      <div class="info-item">
                        <strong>Pass Rate:</strong>
                        <span class="badge bg-success">{{ datasetMetadata.passRate }}%</span>
                      </div>
                      <div class="info-item">
                        <strong>Date Range:</strong>
                        <span class="text-muted">
                          {{ formatDate(datasetMetadata.earliestTimestamp) }} to 
                          {{ formatDate(datasetMetadata.latestTimestamp) }}
                        </span>
                      </div>
                      <div class="info-item">
                        <strong>Duration:</strong>
                        <span class="text-muted">
                          {{ calculateDuration(datasetMetadata.earliestTimestamp, datasetMetadata.latestTimestamp) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-center mt-4">
                  <button 
                    type="button" 
                    class="btn btn-success btn-lg"
                    (click)="proceedToNextStep()">
                    <i class="fas fa-arrow-right me-2"></i>
                    Proceed to Date Ranges
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      min-height: 60vh;
    }

    .upload-area {
      border: 2px dashed #dee2e6;
      border-radius: var(--border-radius);
      padding: 60px 40px;
      text-align: center;
      background-color: #f8f9fa;
      transition: all 0.3s ease;
      cursor: pointer;
      margin-bottom: 20px;
    }

    .upload-area:hover {
      border-color: var(--secondary-color);
      background-color: #e3f2fd;
      transform: translateY(-2px);
    }

    .upload-area.dragover {
      border-color: var(--success-color);
      background-color: #e8f5e8;
      transform: scale(1.02);
    }

    .upload-icon {
      font-size: 4rem;
      color: #6c757d;
      margin-bottom: 20px;
    }

    .upload-success {
      animation: slideIn 0.5s ease-out;
    }

    .info-card {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid var(--secondary-color);
    }

    .info-card h5 {
      color: var(--primary-color);
      margin-bottom: 15px;
      font-weight: 600;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item strong {
      color: var(--dark-color);
    }

    .badge {
      font-size: 0.9rem;
      padding: 6px 12px;
    }

    .alert {
      border-radius: var(--border-radius);
      border: none;
      box-shadow: var(--box-shadow);
    }

    .alert-success {
      background: linear-gradient(135deg, #d4edda, #c3e6cb);
      color: #155724;
    }

    .alert-danger {
      background: linear-gradient(135deg, #f8d7da, #f5c6cb);
      color: #721c24;
    }

    .progress {
      height: 8px;
      border-radius: var(--border-radius);
      background-color: #e9ecef;
      overflow: hidden;
    }

    .progress-bar {
      background: linear-gradient(90deg, var(--secondary-color), #2980b9);
      transition: width 0.6s ease;
    }

    .progress-bar-animated {
      animation: progress-bar-stripes 1s linear infinite;
    }

    @keyframes progress-bar-stripes {
      0% { background-position: 1rem 0; }
      100% { background-position: 0 0; }
    }
  `]
})
export class UploadDatasetComponent implements OnInit {
  isDragOver = false;
  isUploading = false;
  errorMessage = '';
  datasetMetadata: DatasetMetadata | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.apiService.setCurrentStep(1);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }
  //validate and upload csv file
  private handleFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.errorMessage = 'Please select a CSV file.';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.datasetMetadata = null;

    this.apiService.uploadDataset(file).subscribe({
      next: (metadata) => {
        this.isUploading = false;
        this.datasetMetadata = metadata;
        
        if (metadata.status !== 'Success') {
          this.errorMessage = metadata.message;
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.errorMessage = 'Error uploading file. Please try again.';
        console.error('Upload error:', error);
      }
    });
  }
  // reset upload state after failure
  resetUpload(): void {
    this.datasetMetadata = null;
    this.errorMessage = '';
    this.isUploading = false;
  }

  proceedToNextStep(): void {
    this.router.navigate(['/date-ranges']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
  // calculate duration between dates
  calculateDuration(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }
}
