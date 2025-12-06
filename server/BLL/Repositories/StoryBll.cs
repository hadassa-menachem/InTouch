using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using DAL.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class StoryBll : IStoryBll
    {
        private readonly IStoryDal _storyDal;
        private readonly IMapper _mapper;

        public StoryBll(IStoryDal storyDal, IMapper mapper)
        {
            _storyDal = storyDal;
            _mapper = mapper;
        }

        public async Task<List<StoryDTO>> GetAllStories()
        {
            await DeleteOldStories();
            var stories = await _storyDal.GetAllStories();

            var now = DateTime.UtcNow;
            var activeStories = stories.FindAll(s => s.CreatedAt.AddHours(s.DurationInHours) > now);

            return _mapper.Map<List<StoryDTO>>(activeStories);
        }

        public async Task<StoryDTO?> GetStoryById(string id)
        {
            var story = await _storyDal.GetStoryById(id);
            return story == null ? null : _mapper.Map<StoryDTO>(story);
        }

        public async Task<List<StoryDTO>> GetStoriesByUserId(string userId)
        {
            var stories = await _storyDal.GetStoriesByUserId(userId);
            return _mapper.Map<List<StoryDTO>>(stories);
        }

        public async Task<StoryDTO> AddStory(StoryDTO storyDto)
        {
            try
            {
                var story = _mapper.Map<Story>(storyDto);

                await _storyDal.AddStory(story);

                return _mapper.Map<StoryDTO>(story);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task UpdateStory(string id, StoryDTO updatedStoryDto)
        {
            var updatedStory = _mapper.Map<Story>(updatedStoryDto);
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

        public async Task<bool> MarkStoryAsViewed(string storyId, string viewerId)
        {
            var story = await _storyDal.GetStoryById(storyId);
            if (story == null) return false;

            if (!story.ViewedByUserIds.Contains(viewerId))
            {
                story.ViewedByUserIds.Add(viewerId);
                await _storyDal.UpdateStory(story.Id, story);
            }

            return true;
        }
    }
}
