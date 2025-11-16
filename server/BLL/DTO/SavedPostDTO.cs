using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace BLL.DTO
{
    public class SavedPostDTO
    {
        public string PostId { get; set; }          
        public string UserId { get; set; }
    }
}
