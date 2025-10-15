using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface ILikeDal
    {
        Task<List<Like>> GetAllLikes();
        Task<Like> GetLikeById(string id);
        Task<List<Like>> GetLikesByPostId(string postId);
        Task<List<Like>> GetLikesByUserId(string userId);
        Task AddLike(Like like);
        Task DeleteLike(string id);
        Task<bool> IsPostLikedByUser(string postId, string userId);
    }
}
