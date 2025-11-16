using DAL.Interfaces;
using DAL.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class LikeDal : ILikeDal
    {
        private readonly IMongoCollection<Like> _likes;

        public LikeDal(MongoContext context)
        {
            _likes = context.Likes;
        }

        public async Task<List<Like>> GetAllLikes()
        {
            return await _likes.Find(_ => true).ToListAsync();
        }

        public async Task<Like> GetLikeById(string id)
        {
            return await _likes.Find(l => l.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Like>> GetLikesByPostId(string postId)
        {
            return await _likes.Find(l => l.PostId == postId).ToListAsync();
        }

        public async Task<List<Like>> GetLikesByUserId(string userId)
        {
            return await _likes.Find(l => l.UserId == userId).ToListAsync();
        }

        public async Task AddLike(Like like)
        {
            await _likes.InsertOneAsync(like);
        }

        public async Task DeleteLike(string id)
        {
            await _likes.DeleteOneAsync(l => l.Id == id);
        }

        public async Task<bool> IsPostLikedByUser(string postId, string userId)
        {
            var like = await _likes.Find(l => l.PostId == postId && l.UserId == userId).FirstOrDefaultAsync();
            return like != null;
        }
    }
}
