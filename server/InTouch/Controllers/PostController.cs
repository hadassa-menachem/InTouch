using AutoMapper;
using BLL.DTO;
using BLL.Repositories;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

[ApiController]
[Route("api/[controller]")]
public class PostController : ControllerBase
{
    private readonly IMongoCollection<Post> _postCollection;
    private readonly IMongoCollection<Like> _likeCollection;
    private readonly IMongoCollection<User> _userCollection;
    private readonly IMapper _mapper;
    private readonly PostBll _postBll;
    private readonly IWebHostEnvironment _env;
    private readonly IMongoCollection<Comment> _commentCollection;

    public PostController(PostBll postBll, IMongoDatabase database, IMapper mapper, IWebHostEnvironment env)
    {
        _postBll = postBll;
        _postCollection = database.GetCollection<Post>("Post");
        _userCollection = database.GetCollection<User>("User");
        _commentCollection = database.GetCollection<Comment>("Comment");
        _likeCollection = database.GetCollection<Like>("Like");
        _mapper = mapper;
        _env = env;
    }


    [HttpGet]
    public async Task<ActionResult<List<PostDTO>>> GetAllPosts()
    {
        var posts = await _postCollection.Find(_ => true).ToListAsync();
        var postIds = posts.Select(p => p.Id).ToList();

        // שליפת תגובות ולייקים לפי הפוסטים
        var allComments = await _commentCollection.Find(c => postIds.Contains(c.PostId)).ToListAsync();
        var allLikes = await _likeCollection.Find(l => postIds.Contains(l.PostId)).ToListAsync();

        // איסוף כל המשתמשים (פוסטים, תגובות ולייקים)
        var userIds = posts.Select(p => p.UserId)
            .Concat(allComments.Select(c => c.UserId))
            .Concat(allLikes.Select(l => l.UserId))
            .Distinct()
            .ToList();

        var users = await _userCollection.Find(u => userIds.Contains(u.UserId)).ToListAsync();

        // מיפוי משתמשים לכל ישות
        foreach (var post in posts)
        {
            post.User = users.FirstOrDefault(u => u.UserId == post.UserId);
        }

        foreach (var comment in allComments)
        {
            comment.User = users.FirstOrDefault(u => u.UserId == comment.UserId);
        }

        foreach (var like in allLikes)
        {
            like.User = users.FirstOrDefault(u => u.UserId == like.UserId);
        }

        // בניית DTO לכל פוסט כולל תגובות ולייקים
        var postDTOs = posts.Select(post =>
        {
            var postDto = _mapper.Map<PostDTO>(post);

            var postComments = allComments.Where(c => c.PostId == post.Id).ToList();
            var postLikes = allLikes.Where(l => l.PostId == post.Id).ToList();

            postDto.Comments = _mapper.Map<List<CommentDTO>>(postComments);
            postDto.Likes = _mapper.Map<List<LikeDTO>>(postLikes);

            return postDto;
        }).ToList();

        return Ok(postDTOs);
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<Post>> GetPostById(string id)
    {
        var post = await _postBll.GetPostById(id);
        if (post == null)
            return NotFound();
        return Ok(post);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<Post>>> GetPostsByUserId(string userId)
    {
        var posts = await _postBll.GetPostsByUserId(userId);
        return Ok(posts);
    }

    [HttpPost]
    [DisableRequestSizeLimit]
    public async Task<ActionResult> AddPost([FromForm] CreatePostDTO dto, IFormFile? file)
    {
        var user = await _userCollection.Find(u => u.UserId == dto.UserId).FirstOrDefaultAsync();
        if (user == null)
            return BadRequest("משתמש לא נמצא");

        var post = new Post
        {
            Id = ObjectId.GenerateNewId().ToString(),
            UserId = dto.UserId,
            User = user, // אתחול שדה ה־User
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            MediaFiles = new List<MediaFile>()
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

            var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";

            post.MediaFiles.Add(new MediaFile
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Url = fileUrl,
                MediaType = GetMediaTypeFromFile(file.FileName),
                UploadedAt = DateTime.UtcNow,
                PostId = post.Id
            });
        }

        await _postBll.AddPost(post);
        return CreatedAtAction(nameof(GetPostById), new { id = post.Id }, post);
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


    [HttpPut("{id}")]
    public async Task<ActionResult> UpdatePost(string id, Post updatedPost)
    {
        var existingPost = await _postBll.GetPostById(id);
        if (existingPost == null)
            return NotFound();

        await _postBll.UpdatePost(id, updatedPost);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePost(string id)
    {
        var existingPost = await _postBll.GetPostById(id);
        if (existingPost == null)
            return NotFound();

        await _postBll.DeletePost(id);
        return NoContent();
    }
}
