import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TrainingResponse } from '../../models/dataset-metadata.model';
import { StepIndicatorComponent } from '../shared/step-indicator/step-indicator.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';

@Component({
  selector: 'app-model-training',
  standalone: true,
  imports: [CommonModule, StepIndicatorComponent, NavigationComponent],
  template: `
    <div class="training-container fade-in">
      <app-step-indicator [currentStep]="3"></app-step-indicator>
      <app-navigation [currentStep]="3"></app-navigation>

      <div class="row">
        <div class="col-lg-10 mx-auto">
          <div class="card">
            <div class="card-header">
              <h3 class="mb-0">
                <i class="fas fa-brain me-2"></i>
                Model Training & Evaluation
              </h3>
              <p class="mb-0 mt-2">Train your machine learning model and evaluate its performance</p>
            </div>
            <div class="card-body">
              <!-- Training Section -->
              <div class="training-section" *ngIf="!trainingResult">
                <div class="text-center">
                  <div class="training-icon mb-4">
                    <i class="fas fa-robot"></i>
                  </div>
                  <h4>Ready to Train Your Model</h4>
                  <p class="text-muted mb-4">
                    Click the button below to start training your XGBoost model with the configured date ranges.
                    This process will train the model on your training data and evaluate it on the test data.
                  </p>
                  <button 
                    type="button" 
                    class="btn btn-primary btn-lg"
                    [disabled]="isTraining"
                    (click)="trainModel()">
                    <span *ngIf="!isTraining">
                      <i class="fas fa-play-circle me-2"></i>
                      Train Model
                    </span>
                    <span *ngIf="isTraining">
                      <div class="spinner me-2"></div>
                      Training Model...
                    </span>
                  </button>
                </div>

                <!-- Training Progress -->
                <div class="training-progress mt-4" *ngIf="isTraining">
                  <div class="progress mb-3">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                         role="progressbar" 
                         style="width: 100%"></div>
                  </div>
                  <div class="text-center">
                    <p class="text-muted">
                      <i class="fas fa-cog fa-spin me-2"></i>
                      Training in progress... This may take a few minutes.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Training Results -->
              <div class="training-results" *ngIf="trainingResult && trainingResult.success">
                <div class="alert alert-success">
                  <i class="fas fa-check-circle me-2"></i>
                  {{ trainingResult.message }}
                </div>

                <!-- Performance Metrics -->
                <div class="metrics-section">
                  <h5 class="mb-3">
                    <i class="fas fa-chart-line me-2"></i>
                    Model Performance Metrics
                  </h5>
                  <div class="row">
                    <div class="col-md-3">
                      <div class="metric-card accuracy">
                        <div class="metric-icon">
                          <i class="fas fa-bullseye"></i>
                        </div>
                        <div class="metric-content">
                          <div class="metric-value">{{ trainingResult.accuracy }}%</div>
                          <div class="metric-label">Accuracy</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="metric-card precision">
                        <div class="metric-icon">
                          <i class="fas fa-crosshairs"></i>
                        </div>
                        <div class="metric-content">
                          <div class="metric-value">{{ trainingResult.precision }}%</div>
                          <div class="metric-label">Precision</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="metric-card recall">
                        <div class="metric-icon">
                          <i class="fas fa-search"></i>
                        </div>
                        <div class="metric-content">
                          <div class="metric-value">{{ trainingResult.recall }}%</div>
                          <div class="metric-label">Recall</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="metric-card f1score">
                        <div class="metric-icon">
                          <i class="fas fa-balance-scale"></i>
                        </div>
                        <div class="metric-content">
                          <div class="metric-value">{{ trainingResult.f1Score }}%</div>
                          <div class="metric-label">F1-Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Training Chart -->
                <div class="chart-section mt-4" *ngIf="trainingResult.trainingChart">
                  <h5 class="mb-3">
                    <i class="fas fa-chart-area me-2"></i>
                    Training Progress
                  </h5>
                  <div class="chart-container">
                    <img [src]="'data:image/png;base64,' + trainingResult.trainingChart" 
                         alt="Training Progress Chart" 
                         class="img-fluid rounded">
                  </div>
                </div>

                <!-- Confusion Matrix -->
                <div class="confusion-matrix-section mt-4" *ngIf="trainingResult.confusionMatrix">
                  <h5 class="mb-3">
                    <i class="fas fa-th me-2"></i>
                    Confusion Matrix
                  </h5>
                  <div class="chart-container">
                    <img [src]="'data:image/png;base64,' + trainingResult.confusionMatrix" 
                         alt="Confusion Matrix" 
                         class="img-fluid rounded">
                  </div>
                </div>

                <!-- Model Information -->
                <div class="model-info-section mt-4">
                  <h5 class="mb-3">
                    <i class="fas fa-info-circle me-2"></i>
                    Model Information
                  </h5>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="info-item">
                        <strong>Algorithm:</strong>
                        <span class="badge bg-primary">XGBoost</span>
                      </div>
                      <div class="info-item">
                        <strong>Model Type:</strong>
                        <span class="text-muted">Binary Classification</span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="info-item">
                        <strong>Training Status:</strong>
                        <span class="badge bg-success">Completed</span>
                      </div>
                      <div class="info-item">
                        <strong>Ready for Simulation:</strong>
                        <span class="badge bg-success">Yes</span>
                      </div>
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
                    Start Simulation
                  </button>
                </div>
              </div>

              <!-- Error State -->
              <div class="error-section" *ngIf="trainingResult && !trainingResult.success">
                <div class="alert alert-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ trainingResult.message }}
                </div>
                <div class="text-center">
                  <button 
                    type="button" 
                    class="btn btn-warning"
                    (click)="retryTraining()">
                    <i class="fas fa-redo me-2"></i>
                    Retry Training
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
    .training-container {
      min-height: 60vh;
    }

    .training-section {
      text-align: center;
      padding: 40px 20px;
    }

    .training-icon {
      font-size: 4rem;
      color: var(--secondary-color);
    }

    .training-progress {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 20px;
    }

    .training-results {
      animation: slideIn 0.5s ease-out;
    }

    .metrics-section {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 25px;
      margin-bottom: 20px;
    }

    .metric-card {
      background: white;
      border-radius: var(--border-radius);
      padding: 20px;
      text-align: center;
      box-shadow: var(--box-shadow);
      transition: transform 0.3s ease;
      margin-bottom: 20px;
    }

    .metric-card:hover {
      transform: translateY(-5px);
    }

    .metric-card.accuracy {
      border-top: 4px solid var(--success-color);
    }

    .metric-card.precision {
      border-top: 4px solid var(--warning-color);
    }

    .metric-card.recall {
      border-top: 4px solid var(--secondary-color);
    }

    .metric-card.f1score {
      border-top: 4px solid var(--danger-color);
    }

    .metric-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .metric-card.accuracy .metric-icon {
      color: var(--success-color);
    }

    .metric-card.precision .metric-icon {
      color: var(--warning-color);
    }

    .metric-card.recall .metric-icon {
      color: var(--secondary-color);
    }

    .metric-card.f1score .metric-icon {
      color: var(--danger-color);
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--dark-color);
      margin-bottom: 5px;
    }

    .metric-label {
      font-size: 0.9rem;
      color: #6c757d;
      font-weight: 500;
    }

    .chart-section, .confusion-matrix-section {
      background: white;
      border-radius: var(--border-radius);
      padding: 25px;
      box-shadow: var(--box-shadow);
    }

    .chart-container {
      text-align: center;
    }

    .chart-container img {
      max-width: 100%;
      height: auto;
      border-radius: var(--border-radius);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .model-info-section {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 25px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
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

    .fa-spin {
      animation: fa-spin 1s infinite linear;
    }

    @keyframes fa-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .training-section {
        padding: 20px 10px;
      }
      
      .metrics-section {
        padding: 20px;
      }
      
      .chart-section, .confusion-matrix-section, .model-info-section {
        padding: 20px;
      }
      
      .metric-value {
        font-size: 2rem;
      }
    }
  `]
})
export class ModelTrainingComponent implements OnInit {
  isTraining = false;
  trainingResult: TrainingResponse | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.apiService.setCurrentStep(3);
  }

  trainModel(): void {
    this.isTraining = true;
    this.trainingResult = null;

    // Create training request with default date ranges
    const trainingRequest = {
      trainStart: '2021-01-01T00:00:00',
      trainEnd: '2021-06-30T23:59:59',
      testStart: '2021-07-01T00:00:00',
      testEnd: '2021-12-31T23:59:59'
    };

    this.apiService.trainModel(trainingRequest).subscribe({
      next: (result) => {
        this.isTraining = false;
        this.trainingResult = result;
      },
      error: (error) => {
        this.isTraining = false;
        this.trainingResult = {
          success: false,
          message: 'Error training model. Please try again.',
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          confusionMatrix: '',
          trainingChart: ''
        };
        console.error('Training error:', error);
      }
    });
  }

  retryTraining(): void {
    this.trainingResult = null;
    this.trainModel();
  }

  proceedToNextStep(): void {
    if (this.trainingResult && this.trainingResult.success) {
      this.router.navigate(['/simulation']);
    }
  }
}
