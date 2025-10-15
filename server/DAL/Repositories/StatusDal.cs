    using DAL.Interfaces;
    using DAL.Models;
    using global::DAL.Models;
    using MongoDB.Driver;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    namespace DAL.Repositories
    {
        public class StatusDal : IStatusDal
        {
            private readonly IMongoCollection<Status> _statusCollection;
            private readonly IMongoCollection<User> _userCollection;

            public StatusDal(MongoContext context)
            {
                _statusCollection = context.Statuses;
                _userCollection = context.Users;
            }

            public async Task<List<Status>> GetAllStatuses()
            {
                var statuses = await _statusCollection.Find(_ => true).ToListAsync();

                foreach (var status in statuses)
                {
                    status.User = await _userCollection.Find(u => u.UserId == status.UserId).FirstOrDefaultAsync();
                }

                return statuses;
            }

            public async Task<Status?> GetStatusById(string id)
            {
                var status = await _statusCollection.Find(s => s.Id == id).FirstOrDefaultAsync();
                if (status == null) return null;

                status.User = await _userCollection.Find(u => u.UserId == status.UserId).FirstOrDefaultAsync();

                return status;
            }

            public async Task<List<Status>> GetStatusesByUserId(string userId)
            {
                return await _statusCollection.Find(s => s.UserId == userId).ToListAsync();
            }

            public async Task AddStatus(Status status)
            {
                await _statusCollection.InsertOneAsync(status);
            }

            public async Task UpdateStatus(string id, Status updatedStatus)
            {
                await _statusCollection.ReplaceOneAsync(s => s.Id == id, updatedStatus);
            }

            public async Task DeleteStatus(string id)
            {
                await _statusCollection.DeleteOneAsync(s => s.Id == id);
            }
        public async Task DeleteOldStatuses()
        {
            var cutoff = DateTime.UtcNow.AddHours(-24); // כל הסטטוסים שיצאו לפני 24 שעות
            var filter = Builders<Status>.Filter.Lt(s => s.CreatedAt, cutoff);
            await _statusCollection.DeleteManyAsync(filter);
        }

    }
}

