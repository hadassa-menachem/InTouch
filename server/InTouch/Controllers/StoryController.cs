using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoryController : ControllerBase
    {
        private readonly IStoryBll _storyBll;
        private readonly IMapper _mapper;
        private readonly IMongoCollection<User> _userCollection;
        private readonly IWebHostEnvironment _env;

        public StoryController(IStoryBll storyBll, IMongoDatabase database, IMapper mapper, IWebHostEnvironment env)
        {
            _storyBll = storyBll;
            _mapper = mapper;
            _userCollection = database.GetCollection<User>("User");
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<List<Story>>> GetAllStories()
        {
            var stories = await _storyBll.GetAllStories();
            return Ok(stories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Story>> GetStoryById(string id)
        {
            var story = await _storyBll.GetStoryById(id);
            if (story == null) return NotFound();
            return Ok(story);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Story>>> GetStoriesByUserId(string userId)
        {
            var stories = await _storyBll.GetStoriesByUserId(userId);
            return Ok(stories);
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        public async Task<ActionResult> AddStory([FromForm] CreateStoryDTO dto, IFormFile? file)
        {
            var user = await _userCollection.Find(u => u.UserId == dto.UserId).FirstOrDefaultAsync();
            if (user == null)
                return BadRequest("User not found");

            var story = new Story
            {
                Id = ObjectId.GenerateNewId().ToString(),
                UserId = dto.UserId,
                User = user,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            if (file != null && file.Length > 0)
            {
                var uploadsPath = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsPath))
                    Directory.CreateDirectory(uploadsPath);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                story.ImageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
            }

            await _storyBll.AddStory(story);
            return CreatedAtAction(nameof(GetStoryById), new { id = story.Id }, story);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateStory(string id, [FromBody] Story updatedStory)
        {
            var existingStory = await _storyBll.GetStoryById(id);
            if (existingStory == null) return NotFound();

            await _storyBll.UpdateStory(id, updatedStory);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteStory(string id)
        {
            var existingStory = await _storyBll.GetStoryById(id);
            if (existingStory == null) return NotFound();

            await _storyBll.DeleteStory(id);
            return NoContent();
        }
    }
}
