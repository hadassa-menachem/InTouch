using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class FollowBll : IFollowBll
    {
        private readonly IFollowDal idal;
        private readonly IMapper imapper;

        public FollowBll(IFollowDal _idal, IMapper _imapper)
        {
            idal = _idal;
            imapper = _imapper;
        }

        public async Task<List<FollowDTO>> GetAllFollows()
        {
            var follows = await idal.GetAllFollows();
            return imapper.Map<List<FollowDTO>>(follows);
        }

        public async Task<FollowDTO> GetFollowById(string id)
        {
            var follow = await idal.GetFollowById(id);
            return imapper.Map<FollowDTO>(follow);
        }

        public async Task<List<FollowDTO>> GetFollowersByUserId(string userId)
        {
            var followers = await idal.GetFollowersByUserId(userId);
            return imapper.Map<List<FollowDTO>>(followers);
        }

        public async Task<List<FollowDTO>> GetFolloweesByUserId(string userId)
        {
            var followees = await idal.GetFolloweesByUserId(userId);
            return imapper.Map<List<FollowDTO>>(followees);
        }

        public async Task AddFollow(FollowDTO followDto)
        {
            var follow = imapper.Map<Follow>(followDto);
            await idal.AddFollow(follow);
        }

        public async Task UpdateFollow(string id, FollowDTO updatedFollowDto)
        {
            var updatedFollow = imapper.Map<Follow>(updatedFollowDto);
            await idal.UpdateFollow(id, updatedFollow);
        }

        public async Task DeleteFollow(string id)
        {
            await idal.DeleteFollow(id);
        }
    }
}
