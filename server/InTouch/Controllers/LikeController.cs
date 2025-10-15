using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using BLL.Repositories;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class LikeController : ControllerBase
{
    private readonly LikeBll _likeBll;
    private readonly IMongoCollection<Post> _postCollection;
    private readonly IMongoCollection<Like> _likeCollection;
    private readonly IMongoCollection<User> _userCollection;
    private readonly IMapper _mapper;
    private readonly PostBll _postBll;

    public LikeController(IMongoDatabase database,LikeBll likeBll,PostBll postBll,IMapper mapper)
{
    _likeBll = likeBll;
    _postBll = postBll;
    _mapper = mapper;

        _postCollection = database.GetCollection<Post>("Post");
        _likeCollection = database.GetCollection<Like>("Like");
        _userCollection = database.GetCollection<User>("User");
    }


    // GET api/like
    [HttpGet]
    public async Task<ActionResult<List<Like>>> GetAllLikes()
    {
        var likes = await _likeBll.GetAllLikes();
        return Ok(likes);
    }

    // GET api/like/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Like>> GetLikeById(string id)
    {
        var like = await _likeBll.GetLikeById(id);
        if (like == null)
            return NotFound();
        return Ok(like);
    }

    // GET api/like/post/{postId}
    [HttpGet("post/{postId}")]
    public async Task<ActionResult<List<Like>>> GetLikesByPostId(string postId)
    {
        var likes = await _likeBll.GetLikesByPostId(postId);
        return Ok(likes);
    }

    // GET api/like/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<Like>>> GetLikesByUserId(string userId)
    {
        var likes = await _likeBll.GetLikesByUserId(userId);
        return Ok(likes);
    }

    [HttpPost]
    public async Task<IActionResult> AddLike([FromBody] CreateLikeDTO dto)
    {
        var post = await _postCollection.Find(p => p.Id == dto.PostId).FirstOrDefaultAsync();
        if (post == null)
            return NotFound("Post not found");

        var user = await _userCollection.Find(u => u.UserId == dto.UserId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound("User not found");

        var like = new Like
        {
            Id = ObjectId.GenerateNewId().ToString(),
            PostId = dto.PostId,
            UserId = dto.UserId,
            User = user
        };

        // שמור למסד הלייקים
        await _likeBll.AddLike(like); // ← חשוב!

        return Ok();
    }




    // DELETE api/like/{postId}/{userId}
    [HttpDelete("{postId}/{userId}")]
    public async Task<IActionResult> DeleteLike(string postId, string userId)
    {
        var filter = Builders<Like>.Filter.And(
            Builders<Like>.Filter.Eq(l => l.PostId, postId),
            Builders<Like>.Filter.Eq(l => l.UserId, userId)
        );

        var like = await _likeCollection.Find(filter).FirstOrDefaultAsync();

        if (like == null)
            return NotFound("Like not found for this user and post.");

        await _likeCollection.DeleteOneAsync(filter);

        return NoContent();
    }


    // GET api/like/isliked?postId=xxx&userId=yyy
    [HttpGet("isliked")]
    public async Task<ActionResult<bool>> IsPostLikedByUser([FromQuery] string postId, [FromQuery] string userId)
    {
        var isLiked = await _likeBll.IsPostLikedByUser(postId, userId);
        return Ok(isLiked);
    }
}
