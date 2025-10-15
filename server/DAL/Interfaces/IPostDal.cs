using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IPostDal
    {
        Task<List<Post>> GetAllPosts();
        Task<Post> GetPostById(string id);
        Task<List<Post>> GetPostsByUserId(string userId);
        Task AddPost(Post post);
        Task UpdatePost(string id, Post updatedPost);
        Task DeletePost(string id);
    }
}
