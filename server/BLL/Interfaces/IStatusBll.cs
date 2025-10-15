using BLL.DTO;
using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IStatusBll
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
