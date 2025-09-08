import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navigation">
      <div class="nav-item" [class.active]="currentStep === 1">
        <a routerLink="/upload" class="nav-link">
          <i class="fas fa-upload"></i>
          <span>Upload Dataset</span>
        </a>
      </div>
      <div class="nav-item" [class.active]="currentStep === 2">
        <a routerLink="/date-ranges" class="nav-link">
          <i class="fas fa-calendar-alt"></i>
          <span>Date Ranges</span>
        </a>
      </div>
      <div class="nav-item" [class.active]="currentStep === 3">
        <a routerLink="/training" class="nav-link">
          <i class="fas fa-brain"></i>
          <span>Model Training</span>
        </a>
      </div>
      <div class="nav-item" [class.active]="currentStep === 4">
        <a routerLink="/simulation" class="nav-link">
          <i class="fas fa-play-circle"></i>
          <span>Simulation</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .navigation {
      display: flex;
      background: white;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      margin-bottom: 30px;
      overflow: hidden;
    }

    .nav-item {
      flex: 1;
      border-right: 1px solid #e9ecef;
    }

    .nav-item:last-child {
      border-right: none;
    }

    .nav-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 15px;
      text-decoration: none;
      color: #6c757d;
      transition: all 0.3s ease;
      background: white;
    }

    .nav-link:hover {
      background-color: #f8f9fa;
      color: var(--secondary-color);
      text-decoration: none;
    }

    .nav-item.active .nav-link {
      background-color: var(--secondary-color);
      color: white;
    }

    .nav-link i {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }

    .nav-link span {
      font-size: 0.9rem;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .navigation {
        flex-direction: column;
      }

      .nav-item {
        border-right: none;
        border-bottom: 1px solid #e9ecef;
      }

      .nav-item:last-child {
        border-bottom: none;
      }

      .nav-link {
        flex-direction: row;
        padding: 15px 20px;
      }

      .nav-link i {
        margin-bottom: 0;
        margin-right: 10px;
        font-size: 1.2rem;
      }

      .nav-link span {
        font-size: 1rem;
      }
    }
  `]
})
export class NavigationComponent {
  @Input() currentStep: number = 1;
}
