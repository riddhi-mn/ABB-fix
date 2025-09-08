import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-indicator">
      <div class="step" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
        <div class="step-number">1</div>
        <div class="step-label">Upload Dataset</div>
      </div>
      <div class="step" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
        <div class="step-number">2</div>
        <div class="step-label">Date Ranges</div>
      </div>
      <div class="step" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">
        <div class="step-number">3</div>
        <div class="step-label">Model Training</div>
      </div>
      <div class="step" [class.active]="currentStep === 4" [class.completed]="currentStep > 4">
        <div class="step-number">4</div>
        <div class="step-label">Simulation</div>
      </div>
    </div>
  `,
  styles: [`
    .step-indicator {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .step {
      display: flex;
      align-items: center;
      margin: 0 15px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .step:hover {
      transform: translateY(-2px);
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #e9ecef;
      color: #6c757d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-right: 10px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .step.active .step-number {
      background-color: var(--secondary-color);
      color: white;
      border-color: var(--secondary-color);
      box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.2);
    }

    .step.completed .step-number {
      background-color: var(--success-color);
      color: white;
      border-color: var(--success-color);
    }

    .step.completed .step-number::after {
      content: '✓';
      font-size: 16px;
    }

    .step-label {
      font-weight: 500;
      color: var(--dark-color);
      white-space: nowrap;
    }

    .step.active .step-label {
      color: var(--secondary-color);
      font-weight: 600;
    }

    .step.completed .step-label {
      color: var(--success-color);
    }

    @media (max-width: 768px) {
      .step-indicator {
        flex-direction: column;
        align-items: center;
      }
      
      .step {
        margin: 5px 0;
      }
    }
  `]
})
export class StepIndicatorComponent {
  @Input() currentStep: number = 1;
}
