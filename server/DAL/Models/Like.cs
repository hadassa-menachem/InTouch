using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class Like
    {
        public string Id { get; set; }
        public string PostId { get; set; }
        public string UserId { get; set; }

        [BsonIgnoreIfNull]
        public User? User { get; set; }
        public string FullName { get; set; } = "";
    }
}
