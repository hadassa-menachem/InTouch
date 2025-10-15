using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IUserDal
    {
        Task<List<User>> GetAllUsers();
        Task<User> GetUserById(string id);
        Task<User> GetUserByUserName(string userName);
        Task AddUser(User user);
        Task UpdateUser(string id, User updatedUser);
        Task DeleteUser(string id);
    }
}
