import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DateRangeRequest, DateRangeValidation } from '../../models/dataset-metadata.model';
import { StepIndicatorComponent } from '../shared/step-indicator/step-indicator.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';

@Component({
  selector: 'app-date-ranges',
  standalone: true,
  imports: [CommonModule, FormsModule, StepIndicatorComponent, NavigationComponent],
  template: `
    <div class="date-ranges-container fade-in">
      <app-step-indicator [currentStep]="2"></app-step-indicator>
      <app-navigation [currentStep]="2"></app-navigation>

      <div class="row">
        <div class="col-lg-10 mx-auto">
          <div class="card">
            <div class="card-header">
              <h3 class="mb-0">
                <i class="fas fa-calendar-alt me-2"></i>
                Configure Date Ranges
              </h3>
              <p class="mb-0 mt-2">Define training, testing, and simulation periods for your model</p>
            </div>
            <div class="card-body">
              <!-- Date Range Cards -->
              <div class="row">
                <!-- Training Period -->
                <div class="col-md-4">
                  <div class="period-card training">
                    <div class="period-header">
                      <i class="fas fa-graduation-cap"></i>
                      <h5>Training Period</h5>
                    </div>
                    <div class="period-content">
                      <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input 
                          type="date" 
                          class="form-control"
                          [(ngModel)]="dateRanges.trainingStart"
                          (change)="onDateChange()">
                      </div>
                      <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input 
                          type="date" 
                          class="form-control"
                          [(ngModel)]="dateRanges.trainingEnd"
                          (change)="onDateChange()">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Testing Period -->
                <div class="col-md-4">
                  <div class="period-card testing">
                    <div class="period-header">
                      <i class="fas fa-vial"></i>
                      <h5>Testing Period</h5>
                    </div>
                    <div class="period-content">
                      <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input 
                          type="date" 
                          class="form-control"
                          [(ngModel)]="dateRanges.testingStart"
                          (change)="onDateChange()">
                      </div>
                      <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input 
                          type="date" 
                          class="form-control"
                          [(ngModel)]="dateRanges.testingEnd"
                          (change)="onDateChange()">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Simulation Period -->
                <div class="col-md-4">
                  <div class="period-card simulation">
                    <div class="period-header">
                      <i class="fas fa-play-circle"></i>
                      <h5>Simulation Period</h5>
                    </div>
                    <div class="period-content">
                      <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input 
                          type="date" 
                          class="form-control"
                          [(ngModel)]="dateRanges.simulationStart"
                          (change)="onDateChange()">
                      </div>
                      <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input 
                          type="date" 
                          class="form-control"
                          [(ngModel)]="dateRanges.simulationEnd"
                          (change)="onDateChange()">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Validation Section -->
              <div class="validation-section mt-4">
                <div class="text-center">
                  <button 
                    type="button" 
                    class="btn btn-primary btn-lg"
                    [disabled]="!canValidate() || isValidating"
                    (click)="validateRanges()">
                    <span *ngIf="!isValidating">
                      <i class="fas fa-check-circle me-2"></i>
                      Validate Ranges
                    </span>
                    <span *ngIf="isValidating">
                      <div class="spinner me-2"></div>
                      Validating...
                    </span>
                  </button>
                </div>

                <!-- Validation Result -->
                <div class="validation-result mt-4" *ngIf="validationResult">
                  <div class="alert" [class.alert-success]="validationResult.isValid" [class.alert-danger]="!validationResult.isValid">
                    <i class="fas" [class.fa-check-circle]="validationResult.isValid" [class.fa-exclamation-triangle]="!validationResult.isValid"></i>
                    {{ validationResult.message }}
                  </div>
                </div>
              </div>

              <!-- Range Summary -->
              <div class="range-summary" *ngIf="validationResult && validationResult.isValid">
                <h5 class="mb-3">
                  <i class="fas fa-chart-bar me-2"></i>
                  Range Summary
                </h5>
                <div class="row">
                  <div class="col-md-4">
                    <div class="summary-card training">
                      <div class="summary-header">
                        <i class="fas fa-graduation-cap"></i>
                        <span>Training</span>
                      </div>
                      <div class="summary-content">
                        <div class="summary-item">
                          <span class="label">Records:</span>
                          <span class="value">{{ validationResult.trainingRecords | number }}</span>
                        </div>
                        <div class="summary-item">
                          <span class="label">Duration:</span>
                          <span class="value">{{ validationResult.trainingDays }} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="summary-card testing">
                      <div class="summary-header">
                        <i class="fas fa-vial"></i>
                        <span>Testing</span>
                      </div>
                      <div class="summary-content">
                        <div class="summary-item">
                          <span class="label">Records:</span>
                          <span class="value">{{ validationResult.testingRecords | number }}</span>
                        </div>
                        <div class="summary-item">
                          <span class="label">Duration:</span>
                          <span class="value">{{ validationResult.testingDays }} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="summary-card simulation">
                      <div class="summary-header">
                        <i class="fas fa-play-circle"></i>
                        <span>Simulation</span>
                      </div>
                      <div class="summary-content">
                        <div class="summary-item">
                          <span class="label">Records:</span>
                          <span class="value">{{ validationResult.simulationRecords | number }}</span>
                        </div>
                        <div class="summary-item">
                          <span class="label">Duration:</span>
                          <span class="value">{{ validationResult.simulationDays }} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Timeline Visualization -->
                <div class="timeline-section mt-4">
                  <h6 class="mb-3">
                    <i class="fas fa-timeline me-2"></i>
                    Timeline Overview
                  </h6>
                  <div class="timeline-bar">
                    <div class="timeline-segment training" [style.width.%]="getTimelineWidth('training')">
                      <span class="timeline-label">Training</span>
                    </div>
                    <div class="timeline-segment testing" [style.width.%]="getTimelineWidth('testing')">
                      <span class="timeline-label">Testing</span>
                    </div>
                    <div class="timeline-segment simulation" [style.width.%]="getTimelineWidth('simulation')">
                      <span class="timeline-label">Simulation</span>
                    </div>
                  </div>
                </div>

                <!-- Next Button -->
                <div class="text-center mt-4">
                  <button 
                    type="button" 
                    class="btn btn-success btn-lg"
                    (click)="proceedToNextStep()">
                    <i class="fas fa-arrow-right me-2"></i>
                    Proceed to Model Training
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
    .date-ranges-container {
      min-height: 60vh;
    }

    .period-card {
      background: white;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      margin-bottom: 20px;
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .period-card:hover {
      transform: translateY(-5px);
    }

    .period-card.training {
      border-top: 4px solid var(--success-color);
    }

    .period-card.testing {
      border-top: 4px solid var(--warning-color);
    }

    .period-card.simulation {
      border-top: 4px solid var(--secondary-color);
    }

    .period-header {
      background: #f8f9fa;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e9ecef;
    }

    .period-header i {
      font-size: 1.5rem;
      margin-right: 10px;
    }

    .period-card.training .period-header i {
      color: var(--success-color);
    }

    .period-card.testing .period-header i {
      color: var(--warning-color);
    }

    .period-card.simulation .period-header i {
      color: var(--secondary-color);
    }

    .period-header h5 {
      margin: 0;
      font-weight: 600;
      color: var(--dark-color);
    }

    .period-content {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-label {
      font-weight: 600;
      color: var(--dark-color);
      margin-bottom: 8px;
    }

    .validation-section {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 30px;
      text-align: center;
    }

    .validation-result {
      animation: slideIn 0.3s ease-out;
    }

    .range-summary {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 25px;
      margin-top: 20px;
    }

    .summary-card {
      background: white;
      border-radius: var(--border-radius);
      padding: 20px;
      text-align: center;
      box-shadow: var(--box-shadow);
      transition: transform 0.3s ease;
    }

    .summary-card:hover {
      transform: translateY(-3px);
    }

    .summary-card.training {
      border-top: 3px solid var(--success-color);
    }

    .summary-card.testing {
      border-top: 3px solid var(--warning-color);
    }

    .summary-card.simulation {
      border-top: 3px solid var(--secondary-color);
    }

    .summary-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
      font-weight: 600;
      color: var(--dark-color);
    }

    .summary-header i {
      margin-right: 8px;
      font-size: 1.2rem;
    }

    .summary-card.training .summary-header i {
      color: var(--success-color);
    }

    .summary-card.testing .summary-header i {
      color: var(--warning-color);
    }

    .summary-card.simulation .summary-header i {
      color: var(--secondary-color);
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .summary-item .label {
      color: #6c757d;
    }

    .summary-item .value {
      font-weight: 600;
      color: var(--dark-color);
    }

    .timeline-section {
      background: white;
      border-radius: var(--border-radius);
      padding: 20px;
      box-shadow: var(--box-shadow);
    }

    .timeline-bar {
      display: flex;
      height: 40px;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }

    .timeline-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.3s ease;
    }

    .timeline-segment.training {
      background: linear-gradient(135deg, var(--success-color), #229954);
    }

    .timeline-segment.testing {
      background: linear-gradient(135deg, var(--warning-color), #e67e22);
    }

    .timeline-segment.simulation {
      background: linear-gradient(135deg, var(--secondary-color), #2980b9);
    }

    .timeline-label {
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
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

    @media (max-width: 768px) {
      .period-content {
        padding: 15px;
      }
      
      .validation-section {
        padding: 20px;
      }
      
      .range-summary {
        padding: 20px;
      }
    }
  `]
})
export class DateRangesComponent implements OnInit {
  // stores user selected data ranges 
  dateRanges: DateRangeRequest = {
    trainingStart: '',
    trainingEnd: '',
    testingStart: '',
    testingEnd: '',
    simulationStart: '',
    simulationEnd: ''
  };

  validationResult: DateRangeValidation | null = null;
  isValidating = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.apiService.setCurrentStep(2);
    this.initializeDefaultDates();
  }

  private initializeDefaultDates(): void {
    const today = new Date();
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    this.dateRanges.trainingStart = this.formatDate(oneMonthAgo);
    this.dateRanges.trainingEnd = this.formatDate(twoWeeksAgo);
    this.dateRanges.testingStart = this.formatDate(twoWeeksAgo);
    this.dateRanges.testingEnd = this.formatDate(oneWeekAgo);
    this.dateRanges.simulationStart = this.formatDate(oneWeekAgo);
    this.dateRanges.simulationEnd = this.formatDate(today);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onDateChange(): void {
    this.validationResult = null;
  }

  canValidate(): boolean {
    return !!(this.dateRanges.trainingStart && this.dateRanges.trainingEnd &&
              this.dateRanges.testingStart && this.dateRanges.testingEnd &&
              this.dateRanges.simulationStart && this.dateRanges.simulationEnd);
  }
  // validates selected data ranges
  validateRanges(): void {
    if (!this.canValidate()) return;

    this.isValidating = true;
    this.validationResult = null;

    this.apiService.validateDateRanges(this.dateRanges).subscribe({
      next: (result) => {
        this.isValidating = false;
        this.validationResult = result;
      },
      error: (error) => {
        this.isValidating = false;
        this.validationResult = {
          isValid: false,
          message: 'Error validating date ranges. Please try again.',
          trainingRecords: 0,
          testingRecords: 0,
          simulationRecords: 0,
          trainingDays: 0,
          testingDays: 0,
          simulationDays: 0
        };
        console.error('Validation error:', error);
      }
    });
  }

  getTimelineWidth(period: string): number {
    if (!this.validationResult) return 0;

    const totalDays = this.validationResult.trainingDays + 
                     this.validationResult.testingDays + 
                     this.validationResult.simulationDays;

    if (totalDays === 0) return 0;

    switch (period) {
      case 'training':
        return (this.validationResult.trainingDays / totalDays) * 100;
      case 'testing':
        return (this.validationResult.testingDays / totalDays) * 100;
      case 'simulation':
        return (this.validationResult.simulationDays / totalDays) * 100;
      default:
        return 0;
    }
  }
  // navigates to training step if data ranges are valid
  proceedToNextStep(): void {
    if (this.validationResult && this.validationResult.isValid) {
      this.router.navigate(['/training']);
    }
  }
}
