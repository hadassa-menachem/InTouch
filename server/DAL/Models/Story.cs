using System;
using System.Collections.Generic;
using DAL.Repositories;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DAL.Models
{
    public class Story
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string UserId { get; set; }
        public User? User { get; set; }
        public string Content { get; set; } = "";
        public List<MediaFile> MediaFiles { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int DurationInHours { get; set; } = 24;
        public List<string> ViewedByUserIds { get; set; } = new List<string>();
    }
}
