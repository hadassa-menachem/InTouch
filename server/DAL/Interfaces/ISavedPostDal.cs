using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface ISavedPostDal
    {
        Task AddSavedPost(SavedPost savedPost);
        Task RemoveSavedPost(string userId, string postId);
        Task<List<SavedPost>> GetSavedPostsByUserId(string userId);
        Task<bool> IsSavedPost(string userId, string postId);
    }
}
