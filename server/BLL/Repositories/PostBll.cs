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
        private readonly IMapper _mapper;

        public PostBll(IPostDal idal, IMapper mapper)
        {
            _idal = idal;
            _mapper = mapper;
        }

        public async Task<List<PostDTO>> GetAllPosts()
        {
            var posts = await _idal.GetAllPosts();
            return _mapper.Map<List<PostDTO>>(posts);
        }

        public async Task<PostDTO> GetPostById(string id)
        {
            var post = await _idal.GetPostById(id);
            return _mapper.Map<PostDTO>(post);
        }

        public async Task<List<PostDTO>> GetPostsByUserId(string userId)
        {
            var posts = await _idal.GetPostsByUserId(userId);
            return _mapper.Map<List<PostDTO>>(posts);
        }

        public async Task<PostDTO> AddPost(CreatePostDTO dto)
        {
            var post = _mapper.Map<Post>(dto);
            await _idal.AddPost(post);
            return _mapper.Map<PostDTO>(post);
        }

        public async Task<PostDTO> UpdatePost(string id, PostDTO dto)
        {
            var post = _mapper.Map<Post>(dto);
            await _idal.UpdatePost(id, post);
            var updatedPost = await _idal.GetPostById(id);
            return _mapper.Map<PostDTO>(updatedPost);
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
