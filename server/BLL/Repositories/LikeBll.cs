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
        private readonly IUserDal _userDal;  // <-- הוספה
        private readonly IMapper _imapper;

        public LikeBll(ILikeDal idal, IUserDal userDal, IMapper imapper)
        {
            _idal = idal;
            _userDal = userDal;    // <-- שמירה על משתנה
            _imapper = imapper;
        }

        // השגת כל הלייקים כ־DTO
        public async Task<List<LikeDTO>> GetAllLikes()
        {
            var likes = await _idal.GetAllLikes();
            return _imapper.Map<List<LikeDTO>>(likes);
        }

        public async Task<List<LikeDTO>> GetLikesByPostId(string postId)
        {
            var likes = await _idal.GetLikesByPostId(postId);

            var likeDtos = _imapper.Map<List<LikeDTO>>(likes);


            return likeDtos;
        }

        public async Task<List<LikeDTO>> GetLikesByUserId(string userId)
        {
            var likes = await _idal.GetLikesByUserId(userId);
            return _imapper.Map<List<LikeDTO>>(likes);
        }

        public async Task<LikeDTO> AddLike(LikeDTO likeDto)
        {
            Console.WriteLine($"=== BLL.AddLike called with PostId: {likeDto.PostId}, UserId: {likeDto.UserId} ===");

            var like = new Like
            {
                Id = string.IsNullOrEmpty(likeDto.Id) ? ObjectId.GenerateNewId().ToString() : likeDto.Id,
                PostId = likeDto.PostId,
                UserId = likeDto.UserId
            };

            Console.WriteLine($"Created Like entity with Id: {like.Id}");

            await _idal.AddLike(like);

            Console.WriteLine("Like saved to database");

            var likeDtoResult = _imapper.Map<LikeDTO>(like);
            return likeDtoResult;
        }
        // מחיקת לייק לפי UserId ו־PostId
        public async Task DeleteLikeByUserAndPost(string postId, string userId)
        {
            Console.WriteLine($"=== BLL.DeleteLikeByUserAndPost ===");
            Console.WriteLine($"Looking for like with PostId: {postId}, UserId: {userId}");

            var likes = await _idal.GetLikesByPostId(postId);
            Console.WriteLine($"Found {likes.Count} likes for this post");

            var like = likes.Find(l => l.UserId == userId);

            if (like != null)
            {
                Console.WriteLine($"Found like to delete: {like.Id}");
                await _idal.DeleteLike(like.Id);
                Console.WriteLine("✅ Like deleted from database");
            }
            else
            {
                Console.WriteLine("⚠️ No matching like found");
                throw new Exception("Like not found");
            }
        }

        public async Task<bool> IsPostLikedByUser(string postId, string userId)
        {
            return await _idal.IsPostLikedByUser(postId, userId);
        }
    }
}
