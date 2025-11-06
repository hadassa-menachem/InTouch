using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class Post
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string UserId { get; set; }
        public User? User { get; set; }
        public string Content { get; set; } = "";
        public List<MediaFile> MediaFiles { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Comment>? Comments { get; set; } = new();
        public List<Like>? Likes { get; set; } = new();
    }
}
