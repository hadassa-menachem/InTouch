using DAL.Interfaces;
using DAL.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class MediaFileDal : IMediaFileDal
    {
        private readonly IMongoCollection<MediaFile> _mediaFiles;

        public MediaFileDal(MongoContext context)
        {
            _mediaFiles = context.MediaFiles;
        }

        public async Task<List<MediaFile>> GetAllMediaFiles()
        {
            return await _mediaFiles.Find(_ => true).ToListAsync();
        }

        public async Task<MediaFile> GetMediaFileById(string id)
        {
            return await _mediaFiles.Find(m => m.Id == id).FirstOrDefaultAsync();
        }

        public async Task AddMediaFile(MediaFile mediaFile)
        {
            await _mediaFiles.InsertOneAsync(mediaFile);
        }

        public async Task UpdateMediaFile(string id, MediaFile updatedMediaFile)
        {
            await _mediaFiles.ReplaceOneAsync(m => m.Id == id, updatedMediaFile);
        }

        public async Task DeleteMediaFile(string id)
        {
            await _mediaFiles.DeleteOneAsync(m => m.Id == id);
        }
    }
}
