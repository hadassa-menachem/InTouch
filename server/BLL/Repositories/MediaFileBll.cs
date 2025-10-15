using AutoMapper;
using DAL.Interfaces;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class MediaFileBll
    {
        private readonly IMediaFileDal idal;
        private readonly IMapper imapper;

        public MediaFileBll(IMediaFileDal _idal, IMapper _imapper)
        {
            idal = _idal;
            imapper = _imapper;
        }

        public async Task<List<MediaFile>> GetAllMediaFiles()
        {
            return await idal.GetAllMediaFiles();
        }

        public async Task<MediaFile> GetMediaFileById(string id)
        {
            return await idal.GetMediaFileById(id);
        }

        public async Task AddMediaFile(MediaFile mediaFile)
        {
            await idal.AddMediaFile(mediaFile);
        }

        public async Task UpdateMediaFile(string id, MediaFile updatedMediaFile)
        {
            await idal.UpdateMediaFile(id, updatedMediaFile);
        }

        public async Task DeleteMediaFile(string id)
        {
            await idal.DeleteMediaFile(id);
        }
    }
}
