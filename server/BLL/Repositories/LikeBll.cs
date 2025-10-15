using AutoMapper;
using DAL.Interfaces;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class LikeBll
    {
        private readonly ILikeDal idal;
        private readonly IMapper imapper;

        public LikeBll(ILikeDal _idal, IMapper _imapper)
        {
            idal = _idal;
            imapper = _imapper;
        }

        public async Task<List<Like>> GetAllLikes()
        {
            return await idal.GetAllLikes();
        }

        public async Task<Like> GetLikeById(string id)
        {
            return await idal.GetLikeById(id);
        }

        public async Task<List<Like>> GetLikesByPostId(string postId)
        {
            return await idal.GetLikesByPostId(postId);
        }

        public async Task<List<Like>> GetLikesByUserId(string userId)
        {
            return await idal.GetLikesByUserId(userId);
        }

        public async Task AddLike(Like like)
        {
            await idal.AddLike(like);
        }

        public async Task DeleteLike(string id)
        {
            await idal.DeleteLike(id);
        }

        public async Task<bool> IsPostLikedByUser(string postId, string userId)
        {
            return await idal.IsPostLikedByUser(postId, userId);
        }
    }
}
