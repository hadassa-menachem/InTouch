using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IPostBll
    {
        Task CreatePost(Post post);
        Task<Post?> GetPostById(string id);
        Task<List<Post>> GetPostsByUserId(string userId);
        Task UpdatePost(Post post);
        Task DeletePost(string id);
    }
}
