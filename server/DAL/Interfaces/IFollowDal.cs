using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IFollowDal
    {
        Task<List<Follow>> GetAllFollows();
        Task<Follow> GetFollowById(string id);
        Task<List<Follow>> GetFollowersByUserId(string userId); // רשימת העוקבים אחרי המשתמש
        Task<List<Follow>> GetFolloweesByUserId(string userId); // רשימת הנעקבים על ידי המשתמש
        Task AddFollow(Follow follow);
        Task UpdateFollow(string id, Follow updatedFollow);
        Task DeleteFollow(string id);
    }
}
