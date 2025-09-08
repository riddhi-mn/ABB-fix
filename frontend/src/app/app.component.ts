import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i class="fas fa-robot me-3" style="font-size: 2rem; color: var(--secondary-color);"></i>
              <div>
                <h1 class="app-title mb-0">IntelliInspect</h1>
                <p class="app-subtitle mb-0">Real-Time Predictive Quality Control</p>
              </div>
            </div>
            <div class="app-version">
              <span class="badge bg-secondary">v1.0.0</span>
            </div>
          </div>
        </div>
      </header>

      <main class="app-main">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>

      <footer class="app-footer">
        <div class="container text-center">
          <p class="mb-0">BUILT TO OUTRUN</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: linear-gradient(135deg, var(--primary-color), var(--dark-color));
      color: white;
      padding: 20px 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .app-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .app-subtitle {
      font-size: 0.9rem;
      opacity: 0.8;
      margin: 0;
    }

    .app-main {
      flex: 1;
      padding: 30px 0;
    }

    .app-footer {
      background-color: var(--dark-color);
      color: white;
      padding: 20px 0;
      margin-top: auto;
    }

    .app-version .badge {
      font-size: 0.8rem;
    }
  `]
})
export class AppComponent {
  title = 'IntelliInspect';
}
