using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IUserBll
    {
        Task CreateUser(User user);
        Task<User?> GetUserByUsername(string username);
        Task<User?> GetUserById(string id);
        Task UpdateUser(User user);
        Task DeleteUser(string id);
    }
}
