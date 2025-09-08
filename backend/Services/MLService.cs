using IntelliInspect.API.Models;
using System.Text;
using System.Text.Json;

namespace IntelliInspect.API.Services;

public class MLService : IMLService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MLService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IDatasetService _datasetService;

    public MLService(HttpClient httpClient, ILogger<MLService> logger, IConfiguration configuration, IDatasetService datasetService)
    {
        _httpClient = httpClient;
        _logger = logger;
        _configuration = configuration;
        _datasetService = datasetService;
        
        var mlServiceUrl = _configuration["ML_SERVICE_URL"] ?? "http://localhost:8000";
        _httpClient.BaseAddress = new Uri(mlServiceUrl);
    }

    public async Task<TrainingResponse> TrainModelAsync(TrainingRequest request)
    {
        try
        {
            // Check if we need to use automatic time-based splitting
            var (trainingData, testingData) = await GetTrainingAndTestingDataAsync(request);

            if (!trainingData.Any())
            {
                return new TrainingResponse
                {
                    Success = false,
                    Message = "No training data found for the specified date range"
                };
            }

            if (!testingData.Any())
            {
                return new TrainingResponse
                {
                    Success = false,
                    Message = "No testing data found for the specified date range"
                };
            }

            var payload = new
            {
                trainingData = trainingData,
                testingData = testingData
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/train", content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            
            _logger.LogInformation($"ML Service Response: {responseContent}");
            
            var result = JsonSerializer.Deserialize<TrainingResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result != null)
            {
                _logger.LogInformation($"Parsed TrainingResponse - Success: {result.Success}, Accuracy: {result.Accuracy}, Precision: {result.Precision}, Recall: {result.Recall}, F1Score: {result.F1Score}");
            }

            return result ?? new TrainingResponse { Success = false, Message = "Failed to deserialize response" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error training model");
            return new TrainingResponse
            {
                Success = false,
                Message = $"Error training model: {ex.Message}"
            };
        }
    }

    private async Task<(List<object> trainingData, List<object> testingData)> GetTrainingAndTestingDataAsync(TrainingRequest request)
    {
        // First, try to get data using the specified date ranges
        var trainingData = await GetTrainingDataAsync(request.TrainStart, request.TrainEnd);
        var testingData = await GetTrainingDataAsync(request.TestStart, request.TestEnd);
        
        // If testing data is empty but training data exists, check if we need automatic splitting
        if (!testingData.Any() && trainingData.Any())
        {
            _logger.LogInformation("Testing data empty but training data exists. Checking for automatic time-based splitting...");
            
            // Get all available data to check if it's a single-day dataset
            var allRecords = await _datasetService.GetRecordsByDateRangeAsync(request.TrainStart, request.TrainEnd);
            
            if (allRecords.Any())
            {
                var firstRecord = allRecords.First();
                var lastRecord = allRecords.Last();
                
                // Check if all data is on the same day
                if (firstRecord.SyntheticTimestamp.Date == lastRecord.SyntheticTimestamp.Date)
                {
                    _logger.LogInformation($"Detected single-day dataset. Automatically splitting {allRecords.Count} records into training/testing periods.");
                    
                    // Split data: 70% training, 30% testing
                    var splitIndex = (int)(allRecords.Count * 0.7);
                    var trainingRecords = allRecords.Take(splitIndex).ToList();
                    var testingRecords = allRecords.Skip(splitIndex).ToList();
                    
                    _logger.LogInformation($"Automatic split: {trainingRecords.Count} training records, {testingRecords.Count} testing records");
                    
                    // Convert to the expected format
                    trainingData = ConvertRecordsToTrainingData(trainingRecords);
                    testingData = ConvertRecordsToTrainingData(testingRecords);
                }
            }
        }
        
        return (trainingData, testingData);
    }

    private async Task<List<object>> GetTrainingDataAsync(DateTime start, DateTime end)
    {
        var records = await _datasetService.GetRecordsByDateRangeAsync(start, end);
        
        _logger.LogInformation($"Retrieved {records.Count} records for date range {start:yyyy-MM-dd HH:mm:ss} to {end:yyyy-MM-dd HH:mm:ss}");
        
        return ConvertRecordsToTrainingData(records);
    }

    private List<object> ConvertRecordsToTrainingData(List<DatasetRecord> records)
    {
        if (records.Any())
        {
            // Log sample of what we're sending to ML service
            var sampleRecord = records.First();
            _logger.LogInformation($"Sample record - Response: {sampleRecord.Response}, Features JSON length: {sampleRecord.AdditionalFeatures?.Length ?? 0}");
        }
        
        return records.Select(record => new
        {
            timestamp = record.SyntheticTimestamp.ToString("yyyy-MM-dd HH:mm:ss"),
            response = record.Response,
            features = record.AdditionalFeatures // Send all features as JSON
        }).Cast<object>().ToList();
    }

    public async Task<SimulationData> PredictAsync(DatasetRecord record)
    {
        try
        {
            var payload = new
            {
                timestamp = record.SyntheticTimestamp.ToString("yyyy-MM-dd HH:mm:ss"),
                temperature = record.Temperature, // Keep for backward compatibility
                pressure = record.Pressure,       // Keep for backward compatibility
                humidity = record.Humidity,       // Keep for backward compatibility
                additionalFeatures = record.AdditionalFeatures // All features are here now
            };
            
            _logger.LogInformation($"Making prediction for record {record.Id} with {record.AdditionalFeatures?.Length ?? 0} characters of feature data");

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/predict", content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            
            // Parse the JSON response manually to handle timestamp conversion
            using var document = JsonDocument.Parse(responseContent);
            var root = document.RootElement;
            
            var result = new SimulationData
            {
                Timestamp = DateTime.TryParse(root.GetProperty("timestamp").GetString(), out var timestamp) 
                    ? timestamp 
                    : record.SyntheticTimestamp,
                SampleId = root.GetProperty("sampleId").GetString() ?? record.Id.ToString(),
                Prediction = root.GetProperty("prediction").GetString() ?? "Unknown",
                Confidence = root.GetProperty("confidence").GetDouble(),
                Temperature = root.GetProperty("temperature").GetDouble(),
                Pressure = root.GetProperty("pressure").GetDouble(),
                Humidity = root.GetProperty("humidity").GetDouble()
            };

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error making prediction");
            return new SimulationData
            {
                Timestamp = record.SyntheticTimestamp,
                SampleId = record.Id.ToString(),
                Prediction = "Error",
                Confidence = 0.0,
                Temperature = record.Temperature,
                Pressure = record.Pressure,
                Humidity = record.Humidity
            };
        }
    }

    public async Task<bool> IsHealthyAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/health");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
