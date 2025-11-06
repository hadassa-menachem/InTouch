using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class Message
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string SenderId { get; set; }      
        public string ReceiverId { get; set; }    
        public string Content { get; set; }        
        public DateTime SentAt { get; set; } = DateTime.UtcNow; 
        public bool IsRead { get; set; } = false; 
        public bool IsDelivered { get; set; } = false; 
        public string? ImageUrl { get; set; } 
    }
}
