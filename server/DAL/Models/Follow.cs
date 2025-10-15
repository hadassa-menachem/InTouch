using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class Follow
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string FolloweeId { get; set; } // הנעקב

        public string FollowerId { get; set; } // העוקב

        public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
    }
}
