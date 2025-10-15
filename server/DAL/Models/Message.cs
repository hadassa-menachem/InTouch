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

        public string SenderId { get; set; }        // מזהה השולח
        public string ReceiverId { get; set; }      // מזהה הנמען
        public string Content { get; set; }         // תוכן ההודעה
        public DateTime SentAt { get; set; } = DateTime.UtcNow; // תאריך השליחה

        public bool IsRead { get; set; } = false;   // האם ההודעה נקראה
        public bool IsDelivered { get; set; } = false; 

        public string? ImageUrl { get; set; } 
    }

}
