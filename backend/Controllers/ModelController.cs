using IntelliInspect.API.Models;
using IntelliInspect.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliInspect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModelController : ControllerBase
{
    private readonly IMLService _mlService;
    private readonly ILogger<ModelController> _logger;

    public ModelController(IMLService mlService, ILogger<ModelController> logger)
    {
        _mlService = mlService;
        _logger = logger;
    }

    [HttpPost("train")]
    public async Task<ActionResult<TrainingResponse>> TrainModel([FromBody] TrainingRequest request)
    {
        try
        {
            var result = await _mlService.TrainModelAsync(request);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error training model");
            return StatusCode(500, new TrainingResponse { Success = false, Message = "Internal server error" });
        }
    }

    [HttpGet("health")]
    public async Task<ActionResult> HealthCheck()
    {
        try
        {
            var isHealthy = await _mlService.IsHealthyAsync();
            return Ok(new { IsHealthy = isHealthy });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking ML service health");
            return StatusCode(500, new { IsHealthy = false });
        }
    }
}
