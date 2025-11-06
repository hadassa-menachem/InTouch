using AutoMapper;
using BLL.DTO;
using BLL.Functions;
using BLL.Interfaces;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

[ApiController]
[Route("api/[controller]")]
public class PostController : ControllerBase
{
    private readonly IPostBll _postBll;
    private readonly IMapper _mapper;
    private readonly IWebHostEnvironment _env;
    private readonly IMongoCollection<User> _userCollection;

    public PostController(IPostBll postBll, IMongoDatabase database, IMapper mapper, IWebHostEnvironment env)
    {
        _postBll = postBll;
        _mapper = mapper;
        _env = env;
        _userCollection = database.GetCollection<User>("User");
    }
    [HttpGet]
    public async Task<ActionResult<List<Post>>> GetAllPosts()
    {
        var users = await _postBll.GetAllPosts();
        return Ok(users);
    }

    [HttpPost]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> AddPost([FromForm] CreatePostDTO dto, IFormFile? file)
    {
        var user = await _userCollection.Find(u => u.UserId == dto.UserId).FirstOrDefaultAsync();
        if (user == null)
            return BadRequest("משתמש לא נמצא");

        dto.MediaFiles = new List<MediaFile>();

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

            var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";

            dto.MediaFiles.Add(new MediaFile
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Url = fileUrl,
                MediaType = GetMediaTypeFromFile(file.FileName),
                UploadedAt = DateTime.UtcNow
            });
        }

        await _postBll.AddPost(dto); 
        return Ok(dto);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPostById(string id)
    {
        var post = await _postBll.GetPostById(id);
        if (post == null)
            return NotFound();

        return Ok(post);
    }

    private string GetMediaTypeFromFile(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLower();
        if (ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif")
            return "image";
        if (ext == ".mp4" || ext == ".mov" || ext == ".avi")
            return "video";
        return "unknown";
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetPostsByUserId(string userId)
    {
        var posts = await _postBll.GetPostsByUserId(userId);
        if (posts == null || !posts.Any())
            return NotFound();

        return Ok(posts);
    }
}
