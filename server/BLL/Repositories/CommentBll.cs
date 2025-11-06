using AutoMapper;
using DAL.Interfaces;
using DAL.Models;
using BLL.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BLL.Interfaces;

namespace BLL.Repositories
{
    public class CommentBll:ICommentBll
    {
        private readonly ICommentDal _commentDal;
        private readonly IMapper imapper;

        public CommentBll(ICommentDal commentDal, IMapper mapper)
        {
            _commentDal = commentDal;
            this.imapper = mapper; 
        }

        public async Task<List<CommentDTO>> GetAllComments()
        {
            var comments = await _commentDal.GetAllComments();
            return imapper.Map<List<CommentDTO>>(comments);
        }

        public async Task<CommentDTO> GetCommentById(string id)
        {
            var comment = await _commentDal.GetCommentById(id);
            return imapper.Map<CommentDTO>(comment);
        }

        public async Task<List<CommentDTO>> GetCommentsByPostId(string postId)
        {
            var comments = await _commentDal.GetCommentsByPostId(postId);
            var userIds = comments.Select(c => c.UserId).Distinct().ToList();

            var users = await _commentDal.GetUsersByIds(userIds);

            var commentDtos = comments.Select(c =>
            {
                var user = users.FirstOrDefault(u => u.UserId == c.UserId);
                var dto = imapper.Map<CommentDTO>(c);
                dto.UserName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown User";
                return dto;
            }).ToList();

            return commentDtos;
        }

        public async Task AddComment(CommentDTO commentDto)
        {
            var comment = imapper.Map<Comment>(commentDto);
            await _commentDal.AddComment(comment);
        }

        public async Task UpdateComment(string id, CommentDTO updatedCommentDto)
        {
            var updatedComment = imapper.Map<Comment>(updatedCommentDto);
            await _commentDal.UpdateComment(id, updatedComment);
        }

        public async Task DeleteComment(string id)
        {
            await _commentDal.DeleteComment(id);
        }
    }
}
