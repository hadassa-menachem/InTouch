using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class LikeBll : ILikeBll
    {

        private readonly ILikeDal _idal;
        private readonly IMapper imapper;

        public LikeBll(ILikeDal idal, IMapper mapper)
        {
            _idal = idal;
            this.imapper = mapper; 
        }

        public async Task<List<LikeDTO>> GetAllLikes()
        {
            var likes = await _idal.GetAllLikes();
            return imapper.Map<List<LikeDTO>>(likes);
        }

        public async Task<List<LikeDTO>> GetLikesByPostId(string postId)
        {
            var likes = await _idal.GetLikesByPostId(postId);

            var likeDtos = imapper.Map<List<LikeDTO>>(likes);


            return likeDtos;
        }

        public async Task<List<LikeDTO>> GetLikesByUserId(string userId)
        {
            var likes = await _idal.GetLikesByUserId(userId);
            return imapper.Map<List<LikeDTO>>(likes);
        }

        public async Task<LikeDTO> AddLike(LikeDTO likeDto)
        {
            var like = new Like
            {
                Id = string.IsNullOrEmpty(likeDto.Id) ? ObjectId.GenerateNewId().ToString() : likeDto.Id,
                PostId = likeDto.PostId,
                UserId = likeDto.UserId
            };

            await _idal.AddLike(like);

            var likeDtoResult = imapper.Map<LikeDTO>(like);
            return likeDtoResult;
        }

        public async Task DeleteLikeByUserAndPost(string postId, string userId)
        {
            var likes = await _idal.GetLikesByPostId(postId);
            var like = likes.Find(l => l.UserId == userId);

            if (like != null)
            {
                await _idal.DeleteLike(like.Id);
            }
            else
            {
                throw new Exception("Like not found");
            }
        }

        public async Task<bool> IsPostLikedByUser(string postId, string userId)
        {
            return await _idal.IsPostLikedByUser(postId, userId);
        }
    }
}
