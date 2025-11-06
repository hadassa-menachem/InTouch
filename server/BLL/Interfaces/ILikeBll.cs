using BLL.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface ILikeBll
    {
        Task<List<LikeDTO>> GetAllLikes();
        Task<LikeDTO> AddLike(LikeDTO likeDto);
        Task<List<LikeDTO>> GetLikesByUserId(string userId);
        Task DeleteLikeByUserAndPost(string postId, string userId);
        Task<List<LikeDTO>> GetLikesByPostId(string postId);
        Task<bool> IsPostLikedByUser(string postId, string userId);
    }
}
