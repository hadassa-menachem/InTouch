using AutoMapper;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class FollowBll: IFollowBll
    {
        private readonly IFollowDal idal;
        private readonly IMapper imapper;

        public FollowBll(IFollowDal _idal, IMapper _imapper)
        {
            idal = _idal;
            imapper = _imapper;
        }

        public async Task<List<Follow>> GetAllFollows()
        {
            return await idal.GetAllFollows();
        }

        public async Task<Follow> GetFollowById(string id)
        {
            return await idal.GetFollowById(id);
        }

        public async Task<List<Follow>> GetFollowersByUserId(string userId)
        {
            return await idal.GetFollowersByUserId(userId);
        }

        public async Task<List<Follow>> GetFolloweesByUserId(string userId)
        {
            return await idal.GetFolloweesByUserId(userId);
        }

        public async Task AddFollow(Follow follow)
        {
            await idal.AddFollow(follow);
        }

        public async Task UpdateFollow(string id, Follow updatedFollow)
        {
            await idal.UpdateFollow(id, updatedFollow);
        }

        public async Task DeleteFollow(string id)
        {
            await idal.DeleteFollow(id);
        }
    }
}
