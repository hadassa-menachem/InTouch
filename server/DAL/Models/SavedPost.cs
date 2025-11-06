using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class SavedPost
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonRepresentation(BsonType.String)]
        public string UserId { get; set; }

        [BsonRepresentation(BsonType.String)]
        public string PostId { get; set; }

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;

        [BsonIgnore]
        public User? User { get; set; }

        [BsonIgnore]
        public Post? Post { get; set; }
    }
}
