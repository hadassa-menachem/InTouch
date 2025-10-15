using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IStatusDal
    {
        Task<List<Status>> GetAllStatuses();
        Task<Status?> GetStatusById(string id);
        Task<List<Status>> GetStatusesByUserId(string userId);
        Task AddStatus(Status status);
        Task UpdateStatus(string id, Status updatedStatus);
        Task DeleteStatus(string id);
        Task DeleteOldStatuses();
    }
}
