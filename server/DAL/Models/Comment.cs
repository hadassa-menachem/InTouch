using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class Comment
    {
        [BsonId]
            public string Id { get; set; }
            public string PostId { get; set; }
            public string UserId { get; set; }
            public User? User { get; set; } // המשתמש שהגיב
            public string Text { get; set; } = "";
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }

}
