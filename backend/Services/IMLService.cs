using IntelliInspect.API.Models;

namespace IntelliInspect.API.Services;

public interface IMLService
{
    Task<TrainingResponse> TrainModelAsync(TrainingRequest request);
    Task<SimulationData> PredictAsync(DatasetRecord record);
    Task<bool> IsHealthyAsync();
}
