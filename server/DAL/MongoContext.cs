using DAL.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Microsoft.Extensions.Options;
using DAL;

public class MongoContext
{
    private readonly IMongoDatabase _database;

    public MongoContext(IOptions<MongoDbSettings> mongoSettings)
    {
        var client = new MongoClient(mongoSettings.Value.ConnectionString);
        _database = client.GetDatabase(mongoSettings.Value.DatabaseName);
    }
    public IMongoCollection<User> Users => _database.GetCollection<User>("User");
    public IMongoCollection<Post> Posts => _database.GetCollection<Post>("Post");
    public IMongoCollection<Comment> Comments => _database.GetCollection<Comment>("Comment");
    public IMongoCollection<Like> Likes => _database.GetCollection<Like>("Like");
    public IMongoCollection<MediaFile> MediaFiles => _database.GetCollection<MediaFile>("MediaFile");
    public IMongoCollection<Follow> Follows => _database.GetCollection<Follow>("Follow");
    public IMongoCollection<Story> Stories => _database.GetCollection<Story>("Story");
}
