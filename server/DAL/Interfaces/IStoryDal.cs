using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IStoryDal
    {
        Task<List<Story>> GetAllStories();              
        Task<Story?> GetStoryById(string id);
        Task<List<Story>> GetStoriesByUserId(string userId);
        Task AddStory(Story story);
        Task UpdateStory(string id, Story updatedStory);
        Task DeleteStory(string id);
        Task DeleteOldStories();
        Task MarkStoryAsViewed(string storyId, string viewerId);

    }
}
