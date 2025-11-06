using BLL.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IMediaFileBll
    {
        Task<List<MediaFileDTO>> GetAllMediaFiles();
        Task<MediaFileDTO> GetMediaFileById(string id);
        Task AddMediaFile(CreateMediaFileDTO dto);
        Task UpdateMediaFile(string id, MediaFileDTO dto);
        Task DeleteMediaFile(string id);
    }
}
