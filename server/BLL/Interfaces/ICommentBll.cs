using BLL.DTO;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface ICommentBll
    {
        Task CreateComment(Comment comment);

        Task<List<CommentDTO>> GetCommentsByPostId(string postId);

        Task DeleteComment(string id);

        Task<List<Comment>> GetAllComments();

        Task<Comment> GetCommentById(string id);

        Task UpdateComment(string id, Comment updatedComment);
    }
}
