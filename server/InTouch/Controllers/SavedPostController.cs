using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace InTouch.Controllers
{
    public class SavedPostController : Controller
    {
        private readonly IMongoCollection<SavedPost> _savedCollection;
        private readonly IMongoCollection<Post> _postCollection;
        private readonly IMongoCollection<User> _userCollection;

        public SavedPostController(IMongoDatabase database)
        {
            _savedCollection = database.GetCollection<SavedPost>("SavedPost");
            _postCollection = database.GetCollection<Post>("Post");
            _userCollection = database.GetCollection<User>("User");
        }

        [HttpPost]
        public async Task<IActionResult> SavePost([FromBody] SavedPost saved)
        {
            var existing = await _savedCollection.Find(s => s.UserId == saved.UserId && s.PostId == saved.PostId).FirstOrDefaultAsync();
            if (existing != null)
                return BadRequest("הפוסט כבר שמור.");

            await _savedCollection.InsertOneAsync(saved);
            return Ok(saved);
        }

        [HttpDelete]
        public async Task<IActionResult> UnsavePost(string userId, string postId)
        {
            var result = await _savedCollection.DeleteOneAsync(s => s.UserId == userId && s.PostId == postId);
            if (result.DeletedCount == 0)
                return NotFound("לא נמצא שמירה מתאימה.");

            return Ok("הפוסט הוסר מהרשימה שלך.");
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetSavedPostsByUser(string userId)
        {
            var saved = await _savedCollection.Find(s => s.UserId == userId).ToListAsync();

            var postIds = saved.Select(s => s.PostId).ToList();
            var posts = await _postCollection.Find(p => postIds.Contains(p.Id)).ToListAsync();

            return Ok(posts);
        }
    }
}
