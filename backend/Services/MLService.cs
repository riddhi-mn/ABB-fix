using IntelliInspect.API.Models;
using System.Text;
using System.Text.Json;

namespace IntelliInspect.API.Services;

public class MLService : IMLService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MLService> _logger;
    private readonly IConfiguration _configuration;

    public MLService(HttpClient httpClient, ILogger<MLService> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _configuration = configuration;
        
        var mlServiceUrl = _configuration["ML_SERVICE_URL"] ?? "http://localhost:8000";
        _httpClient.BaseAddress = new Uri(mlServiceUrl);
    }

    public async Task<TrainingResponse> TrainModelAsync(TrainingRequest request)
    {
        try
        {
            var payload = new
            {
                trainStart = request.TrainStart.ToString("yyyy-MM-dd HH:mm:ss"),
                trainEnd = request.TrainEnd.ToString("yyyy-MM-dd HH:mm:ss"),
                testStart = request.TestStart.ToString("yyyy-MM-dd HH:mm:ss"),
                testEnd = request.TestEnd.ToString("yyyy-MM-dd HH:mm:ss")
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/train", content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<TrainingResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

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

    public async Task<SimulationData> PredictAsync(DatasetRecord record)
    {
        try
        {
            var payload = new
            {
                timestamp = record.SyntheticTimestamp.ToString("yyyy-MM-dd HH:mm:ss"),
                temperature = record.Temperature,
                pressure = record.Pressure,
                humidity = record.Humidity,
                additionalFeatures = record.AdditionalFeatures
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/predict", content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<SimulationData>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result ?? new SimulationData
            {
                Timestamp = record.SyntheticTimestamp,
                SampleId = record.Id.ToString(),
                Prediction = "Unknown",
                Confidence = 0.0,
                Temperature = record.Temperature,
                Pressure = record.Pressure,
                Humidity = record.Humidity
            };
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
