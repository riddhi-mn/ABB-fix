export interface DatasetMetadata {
  fileName: string;
  totalRecords: number;
  totalColumns: number;
  passRate: number;
  earliestTimestamp: string;
  latestTimestamp: string;
  status: string;
  message: string;
}

export interface DateRangeRequest {
  trainingStart: string;
  trainingEnd: string;
  testingStart: string;
  testingEnd: string;
  simulationStart: string;
  simulationEnd: string;
}

export interface DateRangeValidation {
  isValid: boolean;
  message: string;
  trainingRecords: number;
  testingRecords: number;
  simulationRecords: number;
  trainingDays: number;
  testingDays: number;
  simulationDays: number;
}

export interface TrainingRequest {
  trainStart: string;
  trainEnd: string;
  testStart: string;
  testEnd: string;
}

export interface TrainingResponse {
  success: boolean;
  message: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: string;
  trainingChart: string;
}

export interface SimulationData {
  timestamp: string;
  sampleId: string;
  prediction: string;
  confidence: number;
  temperature: number;
  pressure: number;
  humidity: number;
}

export interface SimulationStats {
  totalPredictions: number;
  passCount: number;
  failCount: number;
  averageConfidence: number;
  isComplete: boolean;
}
