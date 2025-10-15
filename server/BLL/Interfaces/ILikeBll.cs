using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface ILikeBll
    {
        Task AddLike(Like like);
        Task RemoveLike(string likeId);
        Task<List<Like>> GetLikesByPostId(string postId);
        Task<bool> IsPostLikedByUser(string postId, string userId);
    }
}
