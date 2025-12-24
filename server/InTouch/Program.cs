using BLL;
using BLL.Functions;
using BLL.Interfaces;
using BLL.Repositories;
using DAL;
using DAL.Interfaces;
using DAL.Repositories;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AutoMapper
builder.Services.AddAutoMapper(typeof(BLL.Mappings.AutoMappingProfile));

// Mongo settings
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<MongoContext>();

// DAL registrations
builder.Services.AddScoped<IUserDal, UserDal>();
builder.Services.AddScoped<IPostDal, PostDal>();
builder.Services.AddScoped<IMediaFileDal, MediaFileDal>();
builder.Services.AddScoped<ILikeDal, LikeDal>();
builder.Services.AddScoped<IFollowDal, FollowDal>();
builder.Services.AddScoped<ICommentDal, CommentDal>();
builder.Services.AddScoped<IMessageDal, MessageDal>();
builder.Services.AddScoped<IStoryDal, StoryDal>();
builder.Services.AddScoped<ISavedPostDal, SavedPostDal>();
builder.Services.AddScoped<IAiServiceDal, AiServiceDal>();

// BLL registrations 
builder.Services.AddScoped<IUserBll, UserBll>();
builder.Services.AddScoped<IPostBll, PostBll>();
builder.Services.AddScoped<IMediaFileBll, MediaFileBll>();
builder.Services.AddScoped<ILikeBll, LikeBll>();
builder.Services.AddScoped<IFollowBll, FollowBll>();
builder.Services.AddScoped<ICommentBll, CommentBll>();
builder.Services.AddScoped<IMessageBll, MessageBll>();
builder.Services.AddScoped<IStoryBll, StoryBll>();
builder.Services.AddScoped<ISavedPostBll, SavedPostBll>();
builder.Services.AddScoped<IAiServiceBll, AiServiceBll>();
builder.Services.AddHttpClient<IAiServiceDal, AiServiceDal>();
builder.Services.AddScoped<IAiServiceBll, AiServiceBll>();


// Mongo database instance
var mongoSettings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
var mongoClient = new MongoClient(mongoSettings.ConnectionString);
var mongoDatabase = mongoClient.GetDatabase(mongoSettings.DatabaseName);
builder.Services.AddSingleton<IMongoDatabase>(mongoDatabase);
builder.Services.AddAutoMapper(typeof(BLL.Mappings.AutoMappingProfile));


// CORS policy - מאפשר גישה מהשרת של Angular בlocalhost
// CORS policy - מאפשר גישה מכל מקור (לא רק localhost)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()    // מאפשר כל מקור (HTTP, HTTPS, פורטים שונים)
            .AllowAnyHeader()    // מאפשר כל כותרת
            .AllowAnyMethod();   // מאפשר כל סוג בקשה (GET, POST, PUT, DELETE וכו')
    });
});


var app = builder.Build();

// Swagger - רק בסביבת פיתוח
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(); // לאפשר גישה לקבצים סטטיים (כמו תמונות)

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
