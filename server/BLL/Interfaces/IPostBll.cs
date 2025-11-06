using BLL.DTO;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IPostBll
    {
        Task<PostDTO> AddPost(CreatePostDTO dto);
        Task<PostDTO?> GetPostById(string id);
        Task<List<PostDTO>> GetPostsByUserId(string userId);
        Task<PostDTO> UpdatePost(string id, PostDTO dto);
        Task<bool> DeletePost(string id);
        Task<List<PostDTO>> GetAllPosts();
    }
}
