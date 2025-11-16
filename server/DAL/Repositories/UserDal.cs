using DAL.Interfaces;
using DAL.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class UserDal : IUserDal
    {
        private readonly IMongoCollection<User> _users;

        public UserDal(MongoContext context)
        {
            _users = context.Users;
        }

        public async Task<List<User>> GetAllUsers()
        {
            return await _users.Find(_ => true).ToListAsync();
        }

        public async Task<User> GetUserById(string id)
        {
            return await _users.Find(u => u.UserId == id).FirstOrDefaultAsync();
        }

        public async Task<User> GetUserByUserName(string userName)
        {
            return await _users.Find(u => u.UserName == userName).FirstOrDefaultAsync();
        }

        public async Task AddUser(User user)
        {
            await _users.InsertOneAsync(user);
        }

        public async Task UpdateUser(string id, User updatedData)
        {
            var existingUser = await _users.Find(u => u.UserId == id).FirstOrDefaultAsync();

            if (existingUser == null)
                throw new Exception("User not found");

            existingUser.UserName = updatedData.UserName;
            existingUser.FirstName = updatedData.FirstName;
            existingUser.LastName = updatedData.LastName;
            existingUser.DateOfBirth = updatedData.DateOfBirth;
            existingUser.Gender = updatedData.Gender;
            existingUser.Phone = updatedData.Phone;
            existingUser.Email = updatedData.Email;
            existingUser.Password = updatedData.Password;
            existingUser.Bio = updatedData.Bio;
            existingUser.ProfilePicUrl = updatedData.ProfilePicUrl;

            await _users.ReplaceOneAsync(u => u.UserId == id, existingUser);
        }

        public async Task DeleteUser(string id)
        {
            await _users.DeleteOneAsync(u => u.UserId == id);
        }
        public async Task AddFollower(User user, User follower)
        {
            var updateUser = Builders<User>.Update.AddToSet(u => u.FollowersList, follower.UserId);
            await _users.UpdateOneAsync(u => u.UserId == user.UserId, updateUser);

            var updateFollower = Builders<User>.Update.AddToSet(u => u.FollowingsList, user.UserId);
            await _users.UpdateOneAsync(u => u.UserId == follower.UserId, updateFollower);
        }
    }
}
