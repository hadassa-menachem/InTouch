using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class StatusBll : IStatusBll
    {
        private readonly IStatusDal _statusDal;
        private readonly IMapper _mapper;

        public StatusBll(IStatusDal statusDal, IMapper mapper)
        {
            _statusDal = statusDal;
            _mapper = mapper;
        }

        public async Task<List<Status>> GetAllStatuses()
        {
            await DeleteOldStatuses();
            return await _statusDal.GetAllStatuses();
        }

        public async Task<Status?> GetStatusById(string id)
        {
            return await _statusDal.GetStatusById(id);
        }

        public async Task<List<Status>> GetStatusesByUserId(string userId)
        {
            return await _statusDal.GetStatusesByUserId(userId);
        }

        public async Task AddStatus(Status status)
        {
            await _statusDal.AddStatus(status);
        }

        public async Task UpdateStatus(string id, Status updatedStatus)
        {
            await _statusDal.UpdateStatus(id, updatedStatus);
        }

        public async Task DeleteStatus(string id)
        {
            await _statusDal.DeleteStatus(id);
        }
        public async Task DeleteOldStatuses()
        {
            await _statusDal.DeleteOldStatuses();
        }

        }
}
