using DAL.Interfaces;
using DAL.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class StoryDal : IStoryDal
    {
        private readonly IMongoCollection<Story> _storyCollection;
        private readonly IMongoCollection<User> _userCollection;

        public StoryDal(MongoContext context)
        {
            _storyCollection = context.Stories;
            _userCollection = context.Users;
        }

        public async Task<List<Story>> GetAllStories()
        {
            var stories = await _storyCollection.Find(_ => true).ToListAsync();

            foreach (var story in stories)
            {
                story.User = await _userCollection
                    .Find(u => u.UserId == story.UserId)
                    .FirstOrDefaultAsync();
            }

            return stories;
        }

        public async Task<Story?> GetStoryById(string id)
        {
            var story = await _storyCollection.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (story == null) return null;

            story.User = await _userCollection.Find(u => u.UserId == story.UserId).FirstOrDefaultAsync();

            return story;
        }

        public async Task<List<Story>> GetStoriesByUserId(string userId)
        {
            return await _storyCollection.Find(s => s.UserId == userId).ToListAsync();
        }

        public async Task AddStory(Story story)
        {
            await _storyCollection.InsertOneAsync(story);
        }

        public async Task UpdateStory(string id, Story updatedStory)
        {
            await _storyCollection.ReplaceOneAsync(s => s.Id == id, updatedStory);
        }

        public async Task DeleteStory(string id)
        {
            await _storyCollection.DeleteOneAsync(s => s.Id == id);
        }

        public async Task DeleteOldStories()
        {
            var cutoff = DateTime.UtcNow.AddHours(-24); // מוחק סיפורים ישנים מ-24 שעות אחורה
            var filter = Builders<Story>.Filter.Lt(s => s.CreatedAt, cutoff);
            await _storyCollection.DeleteManyAsync(filter);
        }
    }
}
