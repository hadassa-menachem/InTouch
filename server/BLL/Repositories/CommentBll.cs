using AutoMapper;
using DAL.Interfaces;
using DAL.Models;
using BLL.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class CommentBll
    {
        private readonly ICommentDal _commentDal;
        private readonly IMapper _mapper;

        public CommentBll(ICommentDal commentDal, IMapper mapper)
        {
            _commentDal = commentDal;
            _mapper = mapper;
        }

        public async Task<List<Comment>> GetAllComments()
        {
            return await _commentDal.GetAllComments();
        }

        public async Task<Comment> GetCommentById(string id)
        {
            return await _commentDal.GetCommentById(id);
        }

        // כאן מחזירים DTO עם שם משתמש
        public async Task<List<CommentDTO>> GetCommentsByPostId(string postId)
        {
            var comments = await _commentDal.GetCommentsByPostId(postId);
            var userIds = comments.Select(c => c.UserId).Distinct().ToList();

            // שולפים את המשתמשים לפי מזהים
            var users = await _commentDal.GetUsersByIds(userIds);

            var commentDtos = comments.Select(c =>
            {
                var user = users.FirstOrDefault(u => u.UserId == c.UserId);
                var dto = _mapper.Map<CommentDTO>(c);
                dto.UserName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown User";
                return dto;
            }).ToList();

            return commentDtos;
        }

        public async Task AddComment(Comment comment)
        {
            await _commentDal.AddComment(comment);
        }

        public async Task UpdateComment(string id, Comment updatedComment)
        {
            await _commentDal.UpdateComment(id, updatedComment);
        }

        public async Task DeleteComment(string id)
        {
            await _commentDal.DeleteComment(id);
        }
    }
}
