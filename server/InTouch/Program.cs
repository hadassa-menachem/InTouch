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

// DAL + BLL registrations
builder.Services.AddScoped<IUserDal, UserDal>();
builder.Services.AddScoped<UserBll>();
builder.Services.AddScoped<IPostDal, PostDal>();
builder.Services.AddScoped<PostBll>();
builder.Services.AddScoped<IMediaFileDal, MediaFileDal>();
builder.Services.AddScoped<MediaFileBll>();
builder.Services.AddScoped<ILikeDal, LikeDal>();
builder.Services.AddScoped<LikeBll>();
builder.Services.AddScoped<IFollowDal, FollowDal>();
builder.Services.AddScoped<FollowBll>();
builder.Services.AddScoped<ICommentDal, CommentDal>();
builder.Services.AddScoped<CommentBll>();
builder.Services.AddScoped<IMessageDal, MessageDal>();
builder.Services.AddScoped<IMessageBll, MessageBll>();
builder.Services.AddScoped<IStatusDal, StatusDal>();
builder.Services.AddScoped<IStatusBll, StatusBll>();
builder.Services.AddScoped<IStoryDal, StoryDal>();
builder.Services.AddScoped<IStoryBll, StoryBll>();

// Mongo database instance
var mongoSettings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
var mongoClient = new MongoClient(mongoSettings.ConnectionString);
var mongoDatabase = mongoClient.GetDatabase(mongoSettings.DatabaseName);
builder.Services.AddSingleton<IMongoDatabase>(mongoDatabase);

// CORS policy - מאפשר גישה מהשרת של Angular בlocalhost
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy
            .SetIsOriginAllowed(origin => origin.StartsWith("http://localhost"))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
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

app.UseCors("AllowAngularApp"); // הפעלת מדיניות CORS לפני Authorization

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
