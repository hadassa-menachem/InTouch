using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace DAL.Models
{
     public class Status
     {
         [BsonId]
         [BsonRepresentation(BsonType.ObjectId)]
         public string? Id { get; set; }
         
        [BsonRepresentation(BsonType.String)]
         public string UserId { get; set; }
         public string Content { get; set; }
         public DateTime CreatedAt { get; set; }
         public string? ImageUrl { get; set; } 
         
         [BsonIgnore]
         public User? User { get; set; }
        
    }
}