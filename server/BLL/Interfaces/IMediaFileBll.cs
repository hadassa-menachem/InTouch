using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IMediaFileBll
    {
        Task CreateMediaFile(MediaFile mediaFile);
        Task<MediaFile?> GetMediaFileById(string id);
        Task<List<MediaFile>> GetMediaFilesByUserId(string userId);
        Task DeleteMediaFile(string id);
    }
}
