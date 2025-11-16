using BLL.DTO;
using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface ISavedPostBll
    {
        Task SavePost(SavedPostDTO dto);
        Task<bool> UnsavePost(string userId, string postId);
        Task<List<PostDTO>> GetSavedPostsByUserId(string userId);
        Task<bool> IsSavedPost(string userId, string postId);
    }
}
