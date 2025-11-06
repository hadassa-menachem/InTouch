using DAL.Interfaces;
using DAL.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Repositories
{
	public class CommentDal : ICommentDal
	{
		private readonly IMongoCollection<Comment> _comments;
        private readonly IMongoCollection<User> _users;

        public CommentDal(MongoContext context)
		{
			_comments = context.Comments;
            _users = context.Users; 
        }

        public async Task<List<Comment>> GetAllComments()
		{
			return await _comments.Find(_ => true).ToListAsync();
		}

		public async Task<Comment> GetCommentById(string id)
		{
			return await _comments.Find(c => c.Id == id).FirstOrDefaultAsync();
		}

		public async Task<List<Comment>> GetCommentsByPostId(string postId)
		{
			return await _comments.Find(c => c.PostId == postId).ToListAsync();
		}

		public async Task AddComment(Comment comment)
		{
			if (string.IsNullOrEmpty(comment.Id))
			{
				var idProp = typeof(Comment).GetProperty("Id");
				idProp.SetValue(comment, ObjectId.GenerateNewId().ToString());
			}

			await _comments.InsertOneAsync(comment);
		}
		public async Task UpdateComment(string id, Comment updatedComment)
		{
			await _comments.ReplaceOneAsync(c => c.Id == id, updatedComment);
		}

		public async Task DeleteComment(string id)
		{
			await _comments.DeleteOneAsync(c => c.Id == id);
		}
        public async Task<List<User>> GetUsersByIds(List<string> userIds)
        {
            var filter = Builders<User>.Filter.In(u => u.UserId, userIds);
            return await _users.Find(filter).ToListAsync();
        }
    }
}
