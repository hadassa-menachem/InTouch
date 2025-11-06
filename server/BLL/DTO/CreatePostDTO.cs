using DAL.Models;

namespace BLL.DTO
{

    public class CreatePostDTO
    {
        public string UserId { get; set; }
        public string Content { get; set; }
        public List<MediaFile> MediaFiles { get; set; } = new List<MediaFile>();

    }

}
