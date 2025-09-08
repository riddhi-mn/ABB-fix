using IntelliInspect.API.Models;
using IntelliInspect.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliInspect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DatasetController : ControllerBase
{
    private readonly IDatasetService _datasetService;
    private readonly ILogger<DatasetController> _logger;

    public DatasetController(IDatasetService datasetService, ILogger<DatasetController> logger)
    {
        _datasetService = datasetService;
        _logger = logger;
    }

    [HttpPost("upload")]
    public async Task<ActionResult<DatasetMetadata>> UploadDataset(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new DatasetMetadata { Status = "Error", Message = "No file uploaded" });
            }

            var result = await _datasetService.ProcessUploadedFileAsync(file);
            
            if (result.Status == "Error")
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading dataset");
            return StatusCode(500, new DatasetMetadata { Status = "Error", Message = "Internal server error" });
        }
    }

    [HttpPost("validate-ranges")]
    public async Task<ActionResult<DateRangeValidation>> ValidateDateRanges([FromBody] DateRangeRequest request)
    {
        try
        {
            var result = await _datasetService.ValidateDateRangesAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating date ranges");
            return StatusCode(500, new DateRangeValidation { IsValid = false, Message = "Internal server error" });
        }
    }
}
