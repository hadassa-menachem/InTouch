using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AiServiceController : ControllerBase
    {
        private readonly IAiServiceBll _aiService;

        public AiServiceController(IAiServiceBll aiService)
        {
            _aiService = aiService;
        }

        public class SummarizeRequest
        {
            public string Text { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] SummarizeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Text))
                return BadRequest("Text cannot be empty.");

            try
            {
                var summary = await _aiService.SummarizePostAsync(request.Text);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error contacting AI service: {ex.Message}");
            }
        }
    }
}
