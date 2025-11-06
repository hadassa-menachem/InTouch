using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class PostBll : IPostBll
    {
        private readonly IPostDal _idal;
        private readonly IMapper imapper;

        public PostBll(IPostDal idal, IMapper mapper)
        {
            _idal = idal;
            this.imapper = mapper;
        }

        public async Task<List<PostDTO>> GetAllPosts()
        {
            var posts = await _idal.GetAllPosts();
            return imapper.Map<List<PostDTO>>(posts);
        }

        public async Task<PostDTO> GetPostById(string id)
        {
            var post = await _idal.GetPostById(id);
            return imapper.Map<PostDTO>(post);
        }

        public async Task<List<PostDTO>> GetPostsByUserId(string userId)
        {
            var posts = await _idal.GetPostsByUserId(userId);
            return imapper.Map<List<PostDTO>>(posts);
        }

        public async Task<PostDTO> AddPost(CreatePostDTO dto)
        {
            var post = imapper.Map<Post>(dto);
            await _idal.AddPost(post);
            return imapper.Map<PostDTO>(post);
        }

        public async Task<PostDTO> UpdatePost(string id, PostDTO dto)
        {
            var post = imapper.Map<Post>(dto);
            await _idal.UpdatePost(id, post);
            var updatedPost = await _idal.GetPostById(id);
            return imapper.Map<PostDTO>(updatedPost);
        }

        public async Task<bool> DeletePost(string id)
        {
            var post = await _idal.GetPostById(id);
            if (post == null) return false;

            await _idal.DeletePost(id);
            return true;
        }
    }
}
