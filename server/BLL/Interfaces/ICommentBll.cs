using BLL.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface ICommentBll
    {
        Task AddComment(CommentDTO commentDto); 

        Task<List<CommentDTO>> GetCommentsByPostId(string postId); 

        Task DeleteComment(string id);

        Task<List<CommentDTO>> GetAllComments(); 

        Task<CommentDTO> GetCommentById(string id); 

        Task UpdateComment(string id, CommentDTO updatedCommentDto); 
    }
}
