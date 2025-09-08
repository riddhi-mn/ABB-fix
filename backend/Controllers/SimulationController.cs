using IntelliInspect.API.Models;
using IntelliInspect.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliInspect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SimulationController : ControllerBase
{
    private readonly IDatasetService _datasetService;
    private readonly IMLService _mlService;
    private readonly ILogger<SimulationController> _logger;

    public SimulationController(IDatasetService datasetService, IMLService mlService, ILogger<SimulationController> logger)
    {
        _datasetService = datasetService;
        _mlService = mlService;
        _logger = logger;
    }

    [HttpGet("start")]
    public async Task<ActionResult> StartSimulation([FromQuery] DateTime start, [FromQuery] DateTime end)
    {
        try
        {
            var records = await _datasetService.GetRecordsByDateRangeAsync(start, end);
            
            if (!records.Any())
            {
                return BadRequest(new { Message = "No records found for the specified date range" });
            }

            // Check if it's a same-day dataset and use last 30% for simulation
            var simulationRecords = GetSimulationRecords(records, start, end);
            
            _logger.LogInformation($"Simulation started with {simulationRecords.Count} records (original: {records.Count})");

            return Ok(new { Message = "Simulation started", RecordCount = simulationRecords.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting simulation");
            return StatusCode(500, new { Message = "Internal server error" });
        }
    }

    [HttpGet("stream")]
    public async Task<ActionResult<SimulationData>> StreamSimulation([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] int offset = 0)
    {
        try
        {
            var records = await _datasetService.GetRecordsByDateRangeAsync(start, end);
            var simulationRecords = GetSimulationRecords(records, start, end);
            var record = simulationRecords.Skip(offset).FirstOrDefault();

            if (record == null)
            {
                return Ok(new SimulationData { Timestamp = DateTime.MinValue }); // End of stream
            }

            var prediction = await _mlService.PredictAsync(record);
            return Ok(prediction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error streaming simulation data");
            return StatusCode(500, new { Message = "Internal server error" });
        }
    }

    [HttpGet("stats")]
    public async Task<ActionResult<SimulationStats>> GetSimulationStats()
    {
        try
        {
            var stats = await _datasetService.GetSimulationStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting simulation stats");
            return StatusCode(500, new { Message = "Internal server error" });
        }
    }

    private List<DatasetRecord> GetSimulationRecords(List<DatasetRecord> records, DateTime start, DateTime end)
    {
        // Check if it's a same-day dataset
        if (start.Date == end.Date)
        {
            _logger.LogInformation($"Detected same-day simulation dataset. Using last 30% of {records.Count} records.");
            
            // Sort records by timestamp to ensure chronological order
            var sortedRecords = records.OrderBy(r => r.SyntheticTimestamp).ToList();
            
            // Calculate 30% from the end
            var last30PercentCount = (int)(sortedRecords.Count * 0.3);
            var simulationRecords = sortedRecords.TakeLast(last30PercentCount).ToList();
            
            _logger.LogInformation($"Using last {simulationRecords.Count} records for simulation (30% of {sortedRecords.Count})");
            
            return simulationRecords;
        }
        else
        {
            // Multi-day dataset - use all records in the range
            _logger.LogInformation($"Multi-day simulation dataset. Using all {records.Count} records.");
            return records;
        }
    }
}
