namespace IntelliInspect.API.Models;

public class DatasetMetadata
{
    public string FileName { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public int TotalColumns { get; set; }
    public double PassRate { get; set; }
    public DateTime EarliestTimestamp { get; set; }
    public DateTime LatestTimestamp { get; set; }
    public string Status { get; set; } = "Success";
    public string Message { get; set; } = string.Empty;
}

public class DateRangeRequest
{
    public DateTime TrainingStart { get; set; }
    public DateTime TrainingEnd { get; set; }
    public DateTime TestingStart { get; set; }
    public DateTime TestingEnd { get; set; }
    public DateTime SimulationStart { get; set; }
    public DateTime SimulationEnd { get; set; }
}

public class DateRangeValidation
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public int TrainingRecords { get; set; }
    public int TestingRecords { get; set; }
    public int SimulationRecords { get; set; }
    public int TrainingDays { get; set; }
    public int TestingDays { get; set; }
    public int SimulationDays { get; set; }
}

public class TrainingRequest
{
    public DateTime TrainStart { get; set; }
    public DateTime TrainEnd { get; set; }
    public DateTime TestStart { get; set; }
    public DateTime TestEnd { get; set; }
}

public class TrainingResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public double Accuracy { get; set; }
    public double Precision { get; set; }
    public double Recall { get; set; }
    public double F1Score { get; set; }
    public string ConfusionMatrix { get; set; } = string.Empty;
    public string TrainingChart { get; set; } = string.Empty;
}

public class SimulationData
{
    public DateTime Timestamp { get; set; }
    public string SampleId { get; set; } = string.Empty;
    public string Prediction { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public double Temperature { get; set; }
    public double Pressure { get; set; }
    public double Humidity { get; set; }
}

public class SimulationStats
{
    public int TotalPredictions { get; set; }
    public int PassCount { get; set; }
    public int FailCount { get; set; }
    public double AverageConfidence { get; set; }
    public bool IsComplete { get; set; }
}

public class DatasetRecord
{
    public int Id { get; set; }
    public DateTime SyntheticTimestamp { get; set; }
    public int Response { get; set; }
    public double Temperature { get; set; }
    public double Pressure { get; set; }
    public double Humidity { get; set; }
    public string? AdditionalFeatures { get; set; } // JSON string for other features
}

public class ModelTraining
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime TrainStart { get; set; }
    public DateTime TrainEnd { get; set; }
    public DateTime TestStart { get; set; }
    public DateTime TestEnd { get; set; }
    public double Accuracy { get; set; }
    public double Precision { get; set; }
    public double Recall { get; set; }
    public double F1Score { get; set; }
    public string ModelPath { get; set; } = string.Empty;
}

public class SimulationSession
{
    public int Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public DateTime SimulationStart { get; set; }
    public DateTime SimulationEnd { get; set; }
    public int TotalRecords { get; set; }
    public int ProcessedRecords { get; set; }
    public bool IsComplete { get; set; }
}