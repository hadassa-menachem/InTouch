using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using DAL.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class SavedPostBll : ISavedPostBll
    {
        private readonly ISavedPostDal _savedPostDal;
        private readonly IPostDal _postDal; 
        private readonly IMapper _mapper;

        public SavedPostBll(ISavedPostDal savedPostDal, IPostDal postDal, IMapper mapper)
        {
            _savedPostDal = savedPostDal;
            _postDal = postDal;
            _mapper = mapper;
        }

        public async Task<List<PostDTO>> GetSavedPostsByUserId(string userId)
        {
            var savedPosts = await _savedPostDal.GetSavedPostsByUserId(userId);

            var posts = new List<Post>();
            foreach (var saved in savedPosts)
            {
                var post = await _postDal.GetPostById(saved.PostId);
                if (post != null)
                    posts.Add(post);
            }

            return _mapper.Map<List<PostDTO>>(posts);
        }

        public async Task SavePost(SavedPostDTO dto)
        {
            var savedPost = new SavedPost
            {
                UserId = dto.UserId,
                PostId = dto.PostId,
            };

            await _savedPostDal.AddSavedPost(savedPost);
        }

        public async Task<bool> UnsavePost(string userId, string postId)
        {
            await _savedPostDal.RemoveSavedPost(userId, postId);
            return true;
        }

        public async Task<bool> IsSavedPost(string userId, string postId)
        {
            return await _savedPostDal.IsSavedPost(userId, postId);
        }
    }
}

