using BLL.DTO;
using BLL.Interfaces;
using BLL.Repositories;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace InTouch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoryController : ControllerBase
    {
        private readonly IStoryBll _storyBll;
        private readonly IUserBll _userBll;
        private readonly IWebHostEnvironment _env;
        private readonly IMongoCollection<User> _userCollection;

        public StoryController(IStoryBll storyBll, IUserBll userBll, IWebHostEnvironment env, IMongoDatabase database)
        {
            _storyBll = storyBll;
            _userBll = userBll;
            _env = env;
            _userCollection = database.GetCollection<User>("User");
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        public async Task<ActionResult> AddStory([FromForm] StoryDTO dto, IFormFile? file)
        {
            try
            {
                var user = await _userCollection
                    .Find(u => u.UserId == dto.UserId)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return BadRequest("User not found");
                }

                dto.Id = ObjectId.GenerateNewId().ToString();
                dto.CreatedAt = DateTime.UtcNow;
                dto.MediaFiles = new List<MediaFileDTO>();

                if (file != null && file.Length > 0)
                {
                    var uploadsPath = Path.Combine(_env.WebRootPath, "uploads");

                    if (!Directory.Exists(uploadsPath))
                    {
                        Directory.CreateDirectory(uploadsPath);
                    }

                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                    var filePath = Path.Combine(uploadsPath, fileName);


                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";

                    dto.MediaFiles.Add(new MediaFileDTO
                    {
                        Id = ObjectId.GenerateNewId().ToString(),
                        Url = fileUrl,
                        MediaType = GetMediaTypeFromFile(file.FileName),
                        UploadedAt = DateTime.UtcNow
                    });
                }

                await _storyBll.AddStory(dto);

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error adding post: {ex.Message}");
            }
        }

        private string GetMediaTypeFromFile(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLower();
            return extension switch
            {
                ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp" => "image",
                ".mp4" or ".mov" or ".avi" or ".webm" => "video",
                _ => "other"
            };
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StoryDTO>> GetStoryById(string id)
        {
            var story = await _storyBll.GetStoryById(id);
            if (story == null) return NotFound();
            return Ok(story);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<StoryDTO>>> GetStoriesByUserId(string userId)
        {
            var stories = await _storyBll.GetStoriesByUserId(userId);
            return Ok(stories);
        }

        [HttpPost("mark-viewed")]
        public async Task<IActionResult> MarkStoryAsViewed([FromBody] MarkViewedDTO request)
        {
            if (request == null || string.IsNullOrEmpty(request.StoryId) || string.IsNullOrEmpty(request.ViewerId))
                return BadRequest("Invalid request data.");

            var result = await _storyBll.MarkStoryAsViewed(request.StoryId, request.ViewerId);

            if (!result)
                return NotFound("Story or user not found.");

            return Ok("Story marked as viewed.");
        }

        [HttpGet]
        public async Task<ActionResult<List<StoryDTO>>> GetAllStories()
        {
            var stories = await _storyBll.GetAllStories();
            return Ok(stories);
        }

        [HttpGet("active/{userId}")]
        public async Task<ActionResult<List<StoryDTO>>> GetActiveStories(string userId)
        {
            var stories = await _storyBll.GetStoriesByUserId(userId);
            return Ok(stories);
        }
    }
}