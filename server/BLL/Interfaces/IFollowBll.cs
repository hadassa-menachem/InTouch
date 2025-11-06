using BLL.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IFollowBll
    {
        Task<List<FollowDTO>> GetAllFollows();
        Task<FollowDTO> GetFollowById(string id);
        Task<List<FollowDTO>> GetFollowersByUserId(string userId);
        Task<List<FollowDTO>> GetFolloweesByUserId(string userId);
        Task AddFollow(FollowDTO followDto);
        Task UpdateFollow(string id, FollowDTO updatedFollowDto);
        Task DeleteFollow(string id);
    }
}
