using BLL.DTO;
using BLL.Repositories;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

[ApiController]
[Route("api/[controller]")]
public class CommentController : ControllerBase
{
    private readonly CommentBll _commentBll;
    private readonly IMongoCollection<User> _userCollection;
    private readonly IMongoCollection<Post> _postCollection;

    public CommentController(CommentBll commentBll, IMongoDatabase database)
    {
        _commentBll = commentBll;
        _userCollection = database.GetCollection<User>("User");
        _postCollection = database.GetCollection<Post>("Post");

    }

    // GET: api/comment
    [HttpGet]
    public async Task<ActionResult<List<CommentDTO>>> GetAllComments()
    {
        var comments = await _commentBll.GetAllComments();

        var userIds = comments.Select(c => c.UserId).Distinct().ToList();
        var users = await _userCollection.Find(u => userIds.Contains(u.UserId)).ToListAsync();

        var commentDtos = comments.Select(c =>
        {
            var user = users.FirstOrDefault(u => u.UserId == c.UserId);
            return new CommentDTO
            {
                Id = c.Id,
                PostId = c.PostId,
                UserId = c.UserId,
                Content = c.Text,
                CreatedAt = c.CreatedAt,
                UserName = user != null ? $"{user.FirstName} {user.LastName}" : "אנונימי"
            };
        }).ToList();

        return Ok(commentDtos);
    }

    // GET: api/comment/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<CommentDTO>> GetCommentById(string id)
    {
        var comment = await _commentBll.GetCommentById(id);
        if (comment == null)
            return NotFound();

        var user = await _userCollection.Find(u => u.UserId == comment.UserId).FirstOrDefaultAsync();

        var dto = new CommentDTO
        {
            Id = comment.Id,
            PostId = comment.PostId,
            UserId = comment.UserId,
            Content = comment.Text,
            CreatedAt = comment.CreatedAt,
            UserName = user != null ? $"{user.FirstName} {user.LastName}" : "אנונימי"
        };

        return Ok(dto);
    }

    // GET: api/comment/post/{postId}
    [HttpGet("post/{postId}")]
    public async Task<ActionResult<List<CommentDTO>>> GetCommentsByPostId(string postId)
    {
        var comments = await _commentBll.GetCommentsByPostId(postId);

        var userIds = comments.Select(c => c.UserId).Distinct().ToList();
        var users = await _userCollection.Find(u => userIds.Contains(u.UserId)).ToListAsync();

        var commentDtos = comments.Select(c =>
        {
            var user = users.FirstOrDefault(u => u.UserId == c.UserId);
            return new CommentDTO
            {
                Id = c.Id,
                PostId = c.PostId,
                UserId = c.UserId,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UserName = user != null ? $"{user.FirstName} {user.LastName}" : "אנונימי"
            };
        }).ToList();

        return Ok(commentDtos);
    }

    // POST: api/comment
    [HttpPost]
    public async Task<ActionResult> AddComment([FromBody] CreateCommentDTO commentDto)
    {
        var comment = new Comment
        {
            Id = ObjectId.GenerateNewId().ToString(),
            PostId = commentDto.PostId,
            UserId = commentDto.UserId,
            Text = commentDto.Content,
            CreatedAt = DateTime.UtcNow
        };

        await _commentBll.AddComment(comment);
        return CreatedAtAction(nameof(GetCommentById), new { id = comment.Id }, comment);
    }


    // PUT: api/comment/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateComment(string id, [FromBody] UpdateCommentDTO dto)
    {
        var existingComment = await _commentBll.GetCommentById(id);
        if (existingComment == null)
            return NotFound();

        existingComment.Text = dto.Content;

        await _commentBll.UpdateComment(id, existingComment);
        return NoContent();
    }

    // DELETE: api/comment/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteComment(string id)
    {
        var existingComment = await _commentBll.GetCommentById(id);
        if (existingComment == null)
            return NotFound();

          await _commentBll.DeleteComment(id);
        return NoContent();
    }

}
