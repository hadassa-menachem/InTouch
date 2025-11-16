using DAL.Interfaces;
using DAL.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class SavedPostDal : ISavedPostDal
    {
        private readonly IMongoCollection<SavedPost> _collection;

        public SavedPostDal(IMongoDatabase database)
        {
            _collection = database.GetCollection<SavedPost>("SavedPosts");
        }

        public async Task AddSavedPost(SavedPost savedPost)
        {
            await _collection.InsertOneAsync(savedPost);
        }

        public async Task RemoveSavedPost(string userId, string postId)
        {
            var filter = Builders<SavedPost>.Filter.Where(sp => sp.UserId == userId && sp.PostId == postId);
            await _collection.DeleteOneAsync(filter);
        }

        public async Task<List<SavedPost>> GetSavedPostsByUserId(string userId)
        {
            var filter = Builders<SavedPost>.Filter.Eq(sp => sp.UserId, userId);
            return await _collection.Find(filter).ToListAsync();
        }

        public async Task<bool> IsSavedPost(string userId, string postId)
        {
            var filter = Builders<SavedPost>.Filter.Where(sp => sp.UserId == userId && sp.PostId == postId);
            var count = await _collection.CountDocumentsAsync(filter);
            return count > 0;
        }
    }
}
