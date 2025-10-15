using BLL.DTO;
using DAL.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IStoryBll
    {
        Task<List<Story>> GetAllStories();           // שים לב Stories
        Task<Story?> GetStoryById(string id);        // שים לב Story
        Task<List<Story>> GetStoriesByUserId(string userId);
        Task AddStory(Story story);
        Task UpdateStory(string id, Story updatedStory);
        Task DeleteStory(string id);
        Task DeleteOldStories();
    }
}
