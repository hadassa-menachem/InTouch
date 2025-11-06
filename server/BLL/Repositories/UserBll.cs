using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Functions
{
    public class UserBll:IUserBll
    {
        private readonly IUserDal _idal;
        private readonly IMapper imapper;

        public UserBll(IUserDal idal, IMapper imapper)
        {
            _idal = idal;
            this.imapper = imapper; 
        }

        public async Task<List<UserDTO>> GetAllUsers()
        {
            var users = await _idal.GetAllUsers();
            return imapper.Map<List<UserDTO>>(users);
        }

        public async Task<UserDTO> GetUserById(string id)
        {
            var user = await _idal.GetUserById(id);
            return imapper.Map<UserDTO>(user);
        }
      
        public async Task<UserDTO> GetUserByUsername(string userName)
        {
            var user = await _idal.GetUserByUserName(userName);
            return imapper.Map<UserDTO>(user);
        }

        public async Task AddUser(UserDTO dto)
        {
            var user = imapper.Map<User>(dto);
            await _idal.AddUser(user);
        }

        public async Task UpdateUser(string id, UpdateUserDTO dto)
        {
            var updatedUser = imapper.Map<User>(dto);
            await _idal.UpdateUser(id, updatedUser);
        }

        public async Task DeleteUser(string id)
        {
            await _idal.DeleteUser(id);
        }
    }
}
