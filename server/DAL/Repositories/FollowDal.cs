using DAL.Interfaces;
using DAL.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class FollowDal : IFollowDal
    {
        private readonly IMongoCollection<Follow> _follows;

        public FollowDal(MongoContext context)
        {
            _follows = context.Follows;
        }

        public async Task<List<Follow>> GetAllFollows()
        {
            return await _follows.Find(_ => true).ToListAsync();
        }

        public async Task<Follow> GetFollowById(string id)
        {
            return await _follows.Find(f => f.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Follow>> GetFollowersByUserId(string userId)
        {
            return await _follows.Find(f => f.FolloweeId == userId).ToListAsync();
        }

        public async Task<List<Follow>> GetFolloweesByUserId(string userId)
        {
            return await _follows.Find(f => f.FollowerId == userId).ToListAsync();
        }

        public async Task AddFollow(Follow follow)
        {
            await _follows.InsertOneAsync(follow);
        }

        public async Task UpdateFollow(string id, Follow updatedFollow)
        {
            await _follows.ReplaceOneAsync(f => f.Id == id, updatedFollow);
        }

        public async Task DeleteFollow(string id)
        {
            await _follows.DeleteOneAsync(f => f.Id == id);
        }
    }
}
