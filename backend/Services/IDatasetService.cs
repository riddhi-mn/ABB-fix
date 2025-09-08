using IntelliInspect.API.Models;

namespace IntelliInspect.API.Services;

public interface IDatasetService
{
    Task<DatasetMetadata> ProcessUploadedFileAsync(IFormFile file);
    Task<DateRangeValidation> ValidateDateRangesAsync(DateRangeRequest request);
    Task<List<DatasetRecord>> GetRecordsByDateRangeAsync(DateTime start, DateTime end);
    Task<SimulationStats> GetSimulationStatsAsync();
}
