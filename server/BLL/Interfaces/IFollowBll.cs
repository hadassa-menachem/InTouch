using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IFollowBll
    {
        Task<List<Follow>> GetAllFollows();
        Task<Follow> GetFollowById(string id);
        Task<List<Follow>> GetFollowersByUserId(string userId);
        Task<List<Follow>> GetFolloweesByUserId(string userId);
        Task AddFollow(Follow follow);
        Task UpdateFollow(string id, Follow updatedFollow);
        Task DeleteFollow(string id);
    }
}
