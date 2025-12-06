using BLL.DTO;
using DAL.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IStoryBll
    {
        Task<List<StoryDTO>> GetAllStories();          
        Task<StoryDTO?> GetStoryById(string id);      
        Task<List<StoryDTO>> GetStoriesByUserId(string userId);
        Task<StoryDTO> AddStory(StoryDTO storyDto);
        Task UpdateStory(string id, StoryDTO updatedStory);
        Task DeleteStory(string id);
        Task DeleteOldStories();
        Task<bool> MarkStoryAsViewed(string storyId, string viewerId);
    }
}
