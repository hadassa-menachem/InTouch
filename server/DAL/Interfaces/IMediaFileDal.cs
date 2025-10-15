using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IMediaFileDal
    {
        Task<List<MediaFile>> GetAllMediaFiles();
        Task<MediaFile> GetMediaFileById(string id);
        Task AddMediaFile(MediaFile mediaFile);
        Task UpdateMediaFile(string id, MediaFile updatedMediaFile);
        Task DeleteMediaFile(string id);
    }
}
