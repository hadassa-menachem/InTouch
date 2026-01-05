using BLL.Functions;
using BLL.Interfaces;
using BLL.Repositories;
using DAL;
using DAL.Interfaces;
using DAL.Repositories;
using InTouch.Hubs;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ============= MongoDB Settings - קרא מה-appsettings.json =============
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// ============= MongoDB Client & Database =============
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
    return new MongoClient(settings!.ConnectionString);
});

// רישום IMongoDatabase - זה מה שה-DAL שלך צריך!
builder.Services.AddScoped<IMongoDatabase>(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var settings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
    return client.GetDatabase(settings!.DatabaseName);
});

// MongoContext - אם אתה משתמש בו במקומות אחרים
builder.Services.AddScoped<MongoContext>();

// ============= DAL & BLL =============
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

// HttpClient for AI Service
builder.Services.AddHttpClient<IAiServiceDal, AiServiceDal>();

// AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();
app.MapHub<MessageHub>("/messageHub");

app.Run();