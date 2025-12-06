using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string UserId { get; set; }
        public string? UserName { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Bio { get; set; }
        
        [BsonElement("profilePicUrl")]
        public string? ProfilePicUrl { get; set; } = "";
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public List<string> FollowingsList { get; set; } = new List<string>();
        public List<string> FollowersList { get; set; } = new List<string>();
        public List<MediaFile> MediaFiles { get; set; } = new List<MediaFile>();
        public List<Story> Stories { get; set; } = new List<Story>();
        public List<SavedPost> SavedPosts { get; set; } = new List<SavedPost>();
    }
}
