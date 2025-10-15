﻿using DAL.Interfaces;
using DAL.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class PostDal : IPostDal
    {
        private readonly IMongoCollection<Post> _postCollection;
        private readonly IMongoCollection<User> _userCollection;
        private readonly IMongoCollection<Comment> _commentCollection;
        private readonly IMongoCollection<Like> _likeCollection;

        public PostDal(MongoContext context)
        {
            _postCollection = context.Posts;
            _userCollection = context.Users;
            _commentCollection = context.Comments;
            _likeCollection = context.Likes;
        }


        public async Task<List<Post>> GetAllPosts()
        {
            var posts = await _postCollection.Find(_ => true).ToListAsync();

            foreach (var post in posts)
            {
                post.User = await _userCollection.Find(u => u.UserId == post.UserId).FirstOrDefaultAsync();
             
            }

            return posts;
        }

        public async Task<Post?> GetPostById(string id)
        {
            var post = await _postCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
            if (post == null) return null;

            post.User = await _userCollection.Find(u => u.UserId == post.UserId).FirstOrDefaultAsync();
            return post;
        }


        public async Task<List<Post>> GetPostsByUserId(string userId)
        {
            return await _postCollection.Find(p => p.UserId == userId).ToListAsync();
        }

        public async Task AddPost(Post post)
        {
            await _postCollection.InsertOneAsync(post);
        }

        public async Task UpdatePost(string id, Post updatedPost)
        {
            await _postCollection.ReplaceOneAsync(p => p.Id == id, updatedPost);
        }

        public async Task DeletePost(string id)
        {
            await _postCollection.DeleteOneAsync(p => p.Id == id);
        }
    }
}
