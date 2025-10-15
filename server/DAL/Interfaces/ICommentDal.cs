using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface ICommentDal
    {
        Task<List<Comment>> GetAllComments();
        Task<Comment> GetCommentById(string id);
        Task<List<Comment>> GetCommentsByPostId(string postId);
        Task AddComment(Comment comment);
        Task UpdateComment(string id, Comment updatedComment);
        Task DeleteComment(string id);
        Task<List<User>> GetUsersByIds(List<string> userIds);
    }
}
