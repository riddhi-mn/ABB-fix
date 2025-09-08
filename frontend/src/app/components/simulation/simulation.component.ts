import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { SimulationData, SimulationStats } from '../../models/dataset-metadata.model';
import { StepIndicatorComponent } from '../shared/step-indicator/step-indicator.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule, StepIndicatorComponent, NavigationComponent],
  template: `
    <div class="simulation-container fade-in">
      <app-step-indicator [currentStep]="4"></app-step-indicator>
      <app-navigation [currentStep]="4"></app-navigation>

      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-header">
              <h3 class="mb-0">
                <i class="fas fa-play-circle me-2"></i>
                Real-Time Prediction Simulation
              </h3>
              <p class="mb-0 mt-2">Simulate real-time quality predictions with second-level granularity</p>
            </div>
            <div class="card-body">
              <!-- Simulation Controls -->
              <div class="simulation-controls text-center mb-4">
                <button 
                  type="button" 
                  class="btn btn-lg"
                  [class.btn-success]="!isSimulating && !isComplete"
                  [class.btn-warning]="isSimulating"
                  [class.btn-primary]="isComplete"
                  [disabled]="isSimulating"
                  (click)="toggleSimulation()">
                  <span *ngIf="!isSimulating && !isComplete">
                    <i class="fas fa-play me-2"></i>
                    Start Simulation
                  </span>
                  <span *ngIf="isSimulating">
                    <div class="spinner me-2"></div>
                    Running Simulation...
                  </span>
                  <span *ngIf="isComplete">
                    <i class="fas fa-redo me-2"></i>
                    Restart Simulation
                  </span>
                </button>
              </div>

              <!-- Simulation Status -->
              <div class="simulation-status" *ngIf="isSimulating || isComplete">
                <div class="alert" [class.alert-info]="isSimulating" [class.alert-success]="isComplete">
                  <i class="fas" [class.fa-cog]="isSimulating" [class.fa-spin]="isSimulating" [class.fa-check-circle]="isComplete"></i>
                  <span *ngIf="isSimulating">Simulation in progress... Processing records in real-time</span>
                  <span *ngIf="isComplete">Simulation completed successfully!</span>
                </div>
              </div>

              <!-- Statistics Panel -->
              <div class="statistics-panel" *ngIf="isSimulating || isComplete">
                <h5 class="mb-3">
                  <i class="fas fa-chart-bar me-2"></i>
                  Live Statistics
                </h5>
                <div class="row">
                  <div class="col-md-3">
                    <div class="stat-card total">
                      <div class="stat-icon">
                        <i class="fas fa-database"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ stats.totalPredictions }}</div>
                        <div class="stat-label">Total Predictions</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="stat-card pass">
                      <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ stats.passCount }}</div>
                        <div class="stat-label">Pass Count</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="stat-card fail">
                      <div class="stat-icon">
                        <i class="fas fa-times-circle"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ stats.failCount }}</div>
                        <div class="stat-label">Fail Count</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="stat-card confidence">
                      <div class="stat-icon">
                        <i class="fas fa-percentage"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ stats.averageConfidence }}%</div>
                        <div class="stat-label">Avg Confidence</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Charts Section -->
              <div class="charts-section" *ngIf="isSimulating || isComplete">
                <div class="row">
                  <div class="col-md-8">
                    <div class="chart-card">
                      <h5 class="mb-3">
                        <i class="fas fa-chart-line me-2"></i>
                        Real-Time Quality Predictions
                      </h5>
                      <div class="chart-container">
                        <canvas #qualityChart></canvas>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="chart-card">
                      <h5 class="mb-3">
                        <i class="fas fa-chart-pie me-2"></i>
                        Prediction Confidence
                      </h5>
                      <div class="chart-container">
                        <canvas #confidenceChart></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Live Prediction Stream -->
              <div class="prediction-stream" *ngIf="isSimulating || isComplete">
                <h5 class="mb-3">
                  <i class="fas fa-stream me-2"></i>
                  Live Prediction Stream
                </h5>
                <div class="simulation-table">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Sample ID</th>
                        <th>Prediction</th>
                        <th>Confidence</th>
                        <th>Temperature (°C)</th>
                        <th>Pressure (hPa)</th>
                        <th>Humidity (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let prediction of recentPredictions; trackBy: trackByTimestamp">
                        <td>{{ formatTime(prediction.timestamp) }}</td>
                        <td>{{ prediction.sampleId }}</td>
                        <td>
                          <span class="badge" [class.bg-success]="prediction.prediction === 'Pass'" [class.bg-danger]="prediction.prediction === 'Fail'">
                            {{ prediction.prediction }}
                          </span>
                        </td>
                        <td>
                          <div class="confidence-bar">
                            <div class="confidence-fill" [style.width.%]="prediction.confidence"></div>
                            <span class="confidence-text">{{ prediction.confidence }}%</span>
                          </div>
                        </td>
                        <td>{{ prediction.temperature | number:'1.1-1' }}</td>
                        <td>{{ prediction.pressure | number:'1.0-0' }}</td>
                        <td>{{ prediction.humidity | number:'1.1-1' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simulation-container {
      min-height: 60vh;
    }

    .simulation-controls {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 30px;
    }

    .simulation-status {
      margin-bottom: 20px;
    }

    .statistics-panel {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 25px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: white;
      border-radius: var(--border-radius);
      padding: 20px;
      text-align: center;
      box-shadow: var(--box-shadow);
      transition: transform 0.3s ease;
      margin-bottom: 20px;
    }

    .stat-card:hover {
      transform: translateY(-3px);
    }

    .stat-card.total {
      border-top: 4px solid var(--secondary-color);
    }

    .stat-card.pass {
      border-top: 4px solid var(--success-color);
    }

    .stat-card.fail {
      border-top: 4px solid var(--danger-color);
    }

    .stat-card.confidence {
      border-top: 4px solid var(--warning-color);
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .stat-card.total .stat-icon {
      color: var(--secondary-color);
    }

    .stat-card.pass .stat-icon {
      color: var(--success-color);
    }

    .stat-card.fail .stat-icon {
      color: var(--danger-color);
    }

    .stat-card.confidence .stat-icon {
      color: var(--warning-color);
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--dark-color);
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #6c757d;
      font-weight: 500;
    }

    .charts-section {
      margin-bottom: 20px;
    }

    .chart-card {
      background: white;
      border-radius: var(--border-radius);
      padding: 25px;
      box-shadow: var(--box-shadow);
      margin-bottom: 20px;
    }

    .chart-container {
      position: relative;
      height: 300px;
    }

    .prediction-stream {
      background: white;
      border-radius: var(--border-radius);
      padding: 25px;
      box-shadow: var(--box-shadow);
    }

    .simulation-table {
      max-height: 400px;
      overflow-y: auto;
      border-radius: var(--border-radius);
    }

    .table {
      margin-bottom: 0;
    }

    .table th {
      background-color: var(--primary-color);
      color: white;
      border: none;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .table td {
      border-color: #e9ecef;
      vertical-align: middle;
    }

    .confidence-bar {
      position: relative;
      background: #e9ecef;
      border-radius: 10px;
      height: 20px;
      overflow: hidden;
    }

    .confidence-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--success-color), #229954);
      transition: width 0.3s ease;
    }

    .confidence-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.8rem;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .badge {
      font-size: 0.8rem;
      padding: 6px 12px;
    }

    .alert {
      border-radius: var(--border-radius);
      border: none;
      box-shadow: var(--box-shadow);
    }

    .alert-info {
      background: linear-gradient(135deg, #d1ecf1, #bee5eb);
      color: #0c5460;
    }

    .alert-success {
      background: linear-gradient(135deg, #d4edda, #c3e6cb);
      color: #155724;
    }

    .fa-spin {
      animation: fa-spin 1s infinite linear;
    }

    @keyframes fa-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .statistics-panel {
        padding: 20px;
      }
      
      .chart-card, .prediction-stream {
        padding: 20px;
      }
      
      .stat-value {
        font-size: 2rem;
      }
      
      .chart-container {
        height: 250px;
      }
    }
  `]
})
export class SimulationComponent implements OnInit, OnDestroy {
  isSimulating = false;
  isComplete = false;
  simulationSubscription: Subscription | null = null;
  recentPredictions: SimulationData[] = [];
  stats: SimulationStats = {
    totalPredictions: 0,
    passCount: 0,
    failCount: 0,
    averageConfidence: 0,
    isComplete: false
  };

  private maxRecentPredictions = 10;
  private simulationOffset = 0;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.apiService.setCurrentStep(4);
  }

  ngOnDestroy(): void {
    if (this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
    }
  }

  toggleSimulation(): void {
    if (this.isSimulating) {
      this.stopSimulation();
    } else {
      this.startSimulation();
    }
  }

  private startSimulation(): void {
    this.isSimulating = true;
    this.isComplete = false;
    this.recentPredictions = [];
    this.simulationOffset = 0;

    // Start the simulation
    this.apiService.startSimulation('2021-01-01 00:00:00', '2021-12-31 23:59:59').subscribe({
      next: (response) => {
        console.log('Simulation started:', response);
        this.startStreaming();
      },
      error: (error) => {
        console.error('Error starting simulation:', error);
        this.isSimulating = false;
      }
    });
  }
 
  private startStreaming(): void {
    this.simulationSubscription = interval(1000).subscribe(() => {
      this.apiService.streamSimulation('2021-01-01 00:00:00', '2021-12-31 23:59:59', this.simulationOffset).subscribe({
        next: (prediction) => {
          if (prediction.timestamp === '0001-01-01T00:00:00') {
            // End of stream
            this.completeSimulation();
            return;
          }
          // add new predictions to top of stream
          this.recentPredictions.unshift(prediction);
          if (this.recentPredictions.length > this.maxRecentPredictions) {
            this.recentPredictions.pop();
          }

          // Update stats
          this.stats.totalPredictions++;
          if (prediction.prediction === 'Pass') {
            this.stats.passCount++;
          } else {
            this.stats.failCount++;
          }
          this.stats.averageConfidence = (this.stats.averageConfidence + prediction.confidence) / 2;

          this.simulationOffset++;
        },
        error: (error) => {
          console.error('Error streaming simulation:', error);
          this.stopSimulation();
        }
      });
    });
  }
 // stops simulation
  private stopSimulation(): void {
    this.isSimulating = false;
    if (this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
      this.simulationSubscription = null;
    }
  }

  private completeSimulation(): void {
    this.stopSimulation();
    this.isComplete = true;
    this.stats.isComplete = true;
  }

  trackByTimestamp(index: number, prediction: SimulationData): string {
    return prediction.timestamp;
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString();
  }
}
