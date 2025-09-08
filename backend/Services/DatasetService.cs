using IntelliInspect.API.Data;
using IntelliInspect.API.Models;
using Microsoft.EntityFrameworkCore;
using CsvHelper;
using System.Globalization;
using System.Text.Json;

namespace IntelliInspect.API.Services;

public class DatasetService : IDatasetService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatasetService> _logger;

    public DatasetService(ApplicationDbContext context, ILogger<DatasetService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DatasetMetadata> ProcessUploadedFileAsync(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return new DatasetMetadata { Status = "Error", Message = "No file uploaded" };
            }

            if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            {
                return new DatasetMetadata { Status = "Error", Message = "File must be in CSV format" };
            }

            // Clear existing data
            _context.DatasetRecords.RemoveRange(_context.DatasetRecords);
            await _context.SaveChangesAsync();

            var records = new List<DatasetRecord>();
            var startTimestamp = new DateTime(2021, 1, 1, 0, 0, 0);
            var currentTimestamp = startTimestamp;

            using var reader = new StreamReader(file.OpenReadStream());
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
            
            await csv.ReadAsync();
            csv.ReadHeader();
            var headers = csv.HeaderRecord;

            if (!headers.Contains("Response"))
            {
                return new DatasetMetadata { Status = "Error", Message = "CSV must contain 'Response' column" };
            }

            int totalRecords = 0;
            int passCount = 0;
            var additionalFeatures = new Dictionary<string, object>();

            while (await csv.ReadAsync())
            {
                var record = new DatasetRecord
                {
                    SyntheticTimestamp = currentTimestamp,
                    Response = csv.GetField<int>("Response")
                };

                // Extract common sensor features if available
                if (headers.Contains("Temperature"))
                    record.Temperature = csv.GetField<double>("Temperature");
                else
                    record.Temperature = Random.Shared.NextDouble() * 50 + 20; // 20-70°C

                if (headers.Contains("Pressure"))
                    record.Pressure = csv.GetField<double>("Pressure");
                else
                    record.Pressure = Random.Shared.NextDouble() * 200 + 800; // 800-1000 hPa

                if (headers.Contains("Humidity"))
                    record.Humidity = csv.GetField<double>("Humidity");
                else
                    record.Humidity = Random.Shared.NextDouble() * 60 + 20; // 20-80%

                // Store additional features as JSON
                foreach (var header in headers)
                {
                    if (!new[] { "Response", "Temperature", "Pressure", "Humidity" }.Contains(header))
                    {
                        var value = csv.GetField(header);
                        if (double.TryParse(value, out var numValue))
                            additionalFeatures[header] = numValue;
                        else
                            additionalFeatures[header] = value;
                    }
                }

                record.AdditionalFeatures = JsonSerializer.Serialize(additionalFeatures);
                records.Add(record);

                totalRecords++;
                if (record.Response == 1) passCount++;
                currentTimestamp = currentTimestamp.AddSeconds(1);

                // Batch insert every 1000 records
                if (records.Count >= 1000)
                {
                    _context.DatasetRecords.AddRange(records);
                    await _context.SaveChangesAsync();
                    records.Clear();
                }
            }

            // Insert remaining records
            if (records.Count > 0)
            {
                _context.DatasetRecords.AddRange(records);
                await _context.SaveChangesAsync();
            }

            var passRate = totalRecords > 0 ? (double)passCount / totalRecords * 100 : 0;

            return new DatasetMetadata
            {
                FileName = file.FileName,
                TotalRecords = totalRecords,
                TotalColumns = headers.Length,
                PassRate = Math.Round(passRate, 2),
                EarliestTimestamp = startTimestamp,
                LatestTimestamp = currentTimestamp.AddSeconds(-1),
                Status = "Success",
                Message = "Dataset processed successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing uploaded file");
            return new DatasetMetadata { Status = "Error", Message = $"Error processing file: {ex.Message}" };
        }
    }

    public async Task<DateRangeValidation> ValidateDateRangesAsync(DateRangeRequest request)
    {
        try
        {   
            // Check if dates are within dataset range
            var datasetRange = await _context.DatasetRecords
                .Select(r => new { r.SyntheticTimestamp })
                .OrderBy(r => r.SyntheticTimestamp)
                .FirstOrDefaultAsync();

            if (datasetRange == null)
            {
                return new DateRangeValidation
                {
                    IsValid = false,
                    Message = "No dataset available. Please upload a dataset first."
                };
            }

            var earliestDate = await _context.DatasetRecords.MinAsync(r => r.SyntheticTimestamp);
            var latestDate = await _context.DatasetRecords.MaxAsync(r => r.SyntheticTimestamp);

            if (request.TrainingStart < earliestDate || request.SimulationEnd > latestDate)
            {
                return new DateRangeValidation
                {
                    IsValid = false,
                    Message = $"Date ranges must be within dataset range: {earliestDate:yyyy-MM-dd} to {latestDate:yyyy-MM-dd}"
                };
            }

            // Count records in each period
            var trainingRecords = await _context.DatasetRecords
                .CountAsync(r => r.SyntheticTimestamp >= request.TrainingStart && r.SyntheticTimestamp <= request.TrainingEnd);

            var testingRecords = await _context.DatasetRecords
                .CountAsync(r => r.SyntheticTimestamp >= request.TestingStart && r.SyntheticTimestamp <= request.TestingEnd);

            var simulationRecords = await _context.DatasetRecords
                .CountAsync(r => r.SyntheticTimestamp >= request.SimulationStart && r.SyntheticTimestamp <= request.SimulationEnd);

            return new DateRangeValidation
            {
                IsValid = true,
                Message = "Date ranges validated successfully!",
                TrainingRecords = trainingRecords,
                TestingRecords = testingRecords,
                SimulationRecords = simulationRecords,
                TrainingDays = (int)(request.TrainingEnd - request.TrainingStart).TotalDays,
                TestingDays = (int)(request.TestingEnd - request.TestingStart).TotalDays,
                SimulationDays = (int)(request.SimulationEnd - request.SimulationStart).TotalDays
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating date ranges");
            return new DateRangeValidation
            {
                IsValid = false,
                Message = $"Error validating date ranges: {ex.Message}"
            };
        }
    }

    public async Task<List<DatasetRecord>> GetRecordsByDateRangeAsync(DateTime start, DateTime end)
    {
        return await _context.DatasetRecords
            .Where(r => r.SyntheticTimestamp >= start && r.SyntheticTimestamp <= end)
            .OrderBy(r => r.SyntheticTimestamp)
            .ToListAsync();
    }

    public async Task<SimulationStats> GetSimulationStatsAsync()
    {
        var totalRecords = await _context.DatasetRecords.CountAsync();
        var passCount = await _context.DatasetRecords.CountAsync(r => r.Response == 1);
        var failCount = totalRecords - passCount;

        return new SimulationStats
        {
            TotalPredictions = totalRecords,
            PassCount = passCount,
            FailCount = failCount,
            AverageConfidence = 85.5, // This would come from actual predictions
            IsComplete = true
        };
    }
}
