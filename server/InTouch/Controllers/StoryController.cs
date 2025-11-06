using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using BLL.Repositories;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

[ApiController]
[Route("api/[controller]")]
public class StoryController : ControllerBase
{
    private readonly IStoryBll _storyBll;
    private readonly IMongoCollection<Story> _storiesCollection;
    private readonly IMongoCollection<User> _userCollection;
    private readonly IWebHostEnvironment _env;

    public StoryController(IStoryBll storyBll, IMongoDatabase database, IWebHostEnvironment env)
    {
        _storyBll = storyBll;
        _storiesCollection = database.GetCollection<Story>("Stories");
        _userCollection = database.GetCollection<User>("User");
        _env = env;
    }

    [HttpPost]
    [DisableRequestSizeLimit]
    public async Task<ActionResult> AddStory([FromForm] CreateStoryDTO dto, IFormFile? file)
    {
        if (dto == null || string.IsNullOrEmpty(dto.UserId))
            return BadRequest("Invalid request data.");

        try
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
                CreatedAt = DateTime.UtcNow,
                Category = string.IsNullOrEmpty(dto.Category) ? "default" : dto.Category,
                IsTemporary = dto.IsTemporary,
                ImageUrl = dto.ImageUrl  
            };

            if (file != null && file.Length > 0)
            {
                var uploadsPath = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
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

            var update = Builders<User>.Update
                .Push(u => u.Stories, story)
                .AddToSet(u => u.Categories, story.Category);

            await _userCollection.UpdateOneAsync(u => u.UserId == dto.UserId, update);

            return CreatedAtAction(nameof(GetStoryById), new { id = story.Id }, story);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"שגיאה פנימית: {ex.Message}\n{ex.StackTrace}");
        }
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

    [HttpGet("categories/{userId}")]
    public async Task<IActionResult> GetUserCategories(string userId)
    {
        var userStories = await _storiesCollection.Find(s => s.UserId == userId).ToListAsync();

        var categories = userStories
            .Select(s => s.Category)
            .Where(c => !string.IsNullOrEmpty(c))
            .Distinct()
            .ToList();

        return Ok(categories);
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
    public async Task<ActionResult<List<Story>>> GetAllStories()
    {
        var stories = await _storyBll.GetAllStories();
        return Ok(stories);
    }
    [HttpGet("temporary/{userId}")]
    public async Task<IActionResult> GetTemporaryStories(string userId)
    {
        var now = DateTime.UtcNow;

        var temporaryStories = await _storiesCollection.Find(s =>
            s.UserId == userId &&
            s.IsTemporary == true &&
            s.CreatedAt.AddHours(24) > now
        ).ToListAsync();

        return Ok(temporaryStories);
    }


    [HttpGet("highlights/{userId}")]
    public async Task<IActionResult> GetUserHighlights(string userId)
    {
        var highlights = await _storiesCollection.Find(s =>
            s.UserId == userId &&
            (s.IsTemporary == false || s.IsTemporary == null)
        ).ToListAsync();

        var grouped = highlights
            .GroupBy(s => s.Category)
            .ToDictionary(g => g.Key ?? "default", g => g.ToList());

        return Ok(grouped);
    }
}
