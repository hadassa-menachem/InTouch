using DAL.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Like
{
    public string Id { get; set; }
    public string PostId { get; set; }
    public string UserId { get; set; }

    [BsonIgnoreIfNull]
    public User? User { get; set; }
    public string FullName { get; set; } = "";

}
