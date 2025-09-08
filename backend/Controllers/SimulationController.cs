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

            return Ok(new { Message = "Simulation started", RecordCount = records.Count });
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
            var record = records.Skip(offset).FirstOrDefault();

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
}
