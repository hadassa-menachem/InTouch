using AutoMapper;
using DAL;
using DAL.Interfaces;
using DAL.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Functions
{
    public class UserBll
    {
        private readonly IUserDal idal;
        private readonly IMapper imapper;

        public UserBll(IUserDal _idal, IMapper _imapper)
        {
            idal = _idal;
            imapper = _imapper;
        }
        public async Task<List<User>> GetAllUsers()
        {
            return await idal.GetAllUsers();
        }

        public async Task<User> GetUserById(string id)
        {
            return await idal.GetUserById(id);
        }

        public async Task<User> GetUserByUserName(string userName)
        {
            return await idal.GetUserByUserName(userName);
        }

        public async Task AddUser(User user)
        {
            await idal.AddUser(user);
        }

        public async Task UpdateUser(string id, User updatedUser)
        {
            await idal.UpdateUser(id, updatedUser);
        }

        public async Task DeleteUser(string id)
        {
            await idal.DeleteUser(id);
        }
    }
}
