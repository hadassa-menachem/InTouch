using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class MediaFileBll : IMediaFileBll
    {
        private readonly IMediaFileDal _idal;
        private readonly IMapper imapper;

        public MediaFileBll(IMediaFileDal idal, IMapper mapper)
        {
            _idal = idal;
            this.imapper = mapper;
        }

        public async Task<List<MediaFileDTO>> GetAllMediaFiles()
        {
            var mediaFiles = await _idal.GetAllMediaFiles();
            return imapper.Map<List<MediaFileDTO>>(mediaFiles);
        }

        public async Task<MediaFileDTO> GetMediaFileById(string id)
        {
            var mediaFile = await _idal.GetMediaFileById(id);
            return imapper.Map<MediaFileDTO>(mediaFile);
        }

        public async Task AddMediaFile(CreateMediaFileDTO dto)
        {
            var mediaFile = imapper.Map<MediaFile>(dto);
            await _idal.AddMediaFile(mediaFile);
        }

        public async Task UpdateMediaFile(string id, MediaFileDTO dto)
        {
            var updatedMediaFile = imapper.Map<MediaFile>(dto);
            await _idal.UpdateMediaFile(id, updatedMediaFile);
        }

        public async Task DeleteMediaFile(string id)
        {
            await _idal.DeleteMediaFile(id);
        }
    }
}
