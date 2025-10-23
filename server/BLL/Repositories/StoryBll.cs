using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class StoryBll : IStoryBll   // 
    {
        private readonly IStoryDal _storyDal;   // 
        private readonly IMapper _mapper;

        public StoryBll(IStoryDal storyDal, IMapper mapper)   // 
        {
            _storyDal = storyDal;
            _mapper = mapper;
        }

        public async Task<List<Story>> GetAllStories()   // 
        {
            await DeleteOldStories();
            return await _storyDal.GetAllStories();
        }

        public async Task<Story?> GetStoryById(string id)
        {
            return await _storyDal.GetStoryById(id);
        }

        public async Task<List<Story>> GetStoriesByUserId(string userId)
        {
            return await _storyDal.GetStoriesByUserId(userId);
        }

        public async Task AddStory(Story story)
        {
            await _storyDal.AddStory(story);
        }

        public async Task UpdateStory(string id, Story updatedStory)
        {
            await _storyDal.UpdateStory(id, updatedStory);
        }

        public async Task DeleteStory(string id)
        {
            await _storyDal.DeleteStory(id);
        }

        public async Task DeleteOldStories()
        {
            await _storyDal.DeleteOldStories();
        }
    }
}
