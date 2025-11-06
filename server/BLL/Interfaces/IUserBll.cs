using BLL.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IUserBll
    {
        Task AddUser(UserDTO dto);
        Task<UserDTO> GetUserByUsername(string userName);
        Task<UserDTO?> GetUserById(string id);
        Task UpdateUser(string id, UpdateUserDTO dto);
        Task DeleteUser(string id);
        Task<List<UserDTO>> GetAllUsers();
    }
}
