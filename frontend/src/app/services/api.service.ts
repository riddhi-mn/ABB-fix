import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { 
  DatasetMetadata, 
  DateRangeRequest, 
  DateRangeValidation, 
  TrainingRequest, 
  TrainingResponse, 
  SimulationData, 
  SimulationStats 
} from '../models/dataset-metadata.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:5000/api';
  private currentStepSubject = new BehaviorSubject<number>(1);
  public currentStep$ = this.currentStepSubject.asObservable();

  constructor(private http: HttpClient) {}

  setCurrentStep(step: number): void {
    this.currentStepSubject.next(step);
  }

  getCurrentStep(): number {
    return this.currentStepSubject.value;
  }

  // Dataset endpoints
  uploadDataset(file: File): Observable<DatasetMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<DatasetMetadata>(`${this.baseUrl}/dataset/upload`, formData);
  }

  validateDateRanges(request: DateRangeRequest): Observable<DateRangeValidation> {
    return this.http.post<DateRangeValidation>(`${this.baseUrl}/dataset/validate-ranges`, request);
  }

  // Model endpoints
  trainModel(request: TrainingRequest): Observable<TrainingResponse> {
    return this.http.post<TrainingResponse>(`${this.baseUrl}/model/train`, request);
  }

  checkModelHealth(): Observable<{ isHealthy: boolean }> {
    return this.http.get<{ isHealthy: boolean }>(`${this.baseUrl}/model/health`);
  }

  // Simulation endpoints
  startSimulation(start: string, end: string): Observable<{ message: string; recordCount: number }> {
    return this.http.get<{ message: string; recordCount: number }>(
      `${this.baseUrl}/simulation/start?start=${start}&end=${end}`
    );
  }

  streamSimulation(start: string, end: string, offset: number = 0): Observable<SimulationData> {
    return this.http.get<SimulationData>(
      `${this.baseUrl}/simulation/stream?start=${start}&end=${end}&offset=${offset}`
    );
  }

  getSimulationStats(): Observable<SimulationStats> {
    return this.http.get<SimulationStats>(`${this.baseUrl}/simulation/stats`);
  }
}
