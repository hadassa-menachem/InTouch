using AutoMapper;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class PostBll
    {
        private readonly IPostDal idal;
        private readonly IMapper imapper;

        public PostBll(IPostDal _idal, IMapper _imapper)
        {
            idal = _idal;
            imapper = _imapper;
        }

        public async Task<List<Post>> GetAllPosts()
        {
            return await idal.GetAllPosts();
        }

        public async Task<Post> GetPostById(string id)
        {
            return await idal.GetPostById(id);
        }

        public async Task<List<Post>> GetPostsByUserId(string userId)
        {
            return await idal.GetPostsByUserId(userId);
        }

        public async Task AddPost(Post post)
        {
            await idal.AddPost(post);
        }

        public async Task UpdatePost(string id, Post updatedPost)
        {
            await idal.UpdatePost(id, updatedPost);
        }

        public async Task DeletePost(string id)
        {
            await idal.DeletePost(id);
        }
    }
}
