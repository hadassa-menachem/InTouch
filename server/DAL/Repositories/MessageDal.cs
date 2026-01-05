using DAL.Interfaces;
using DAL.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class MessageDal : IMessageDal
    {
        private readonly IMongoCollection<Message> _messages;

        public MessageDal(IMongoDatabase db)
        {
            _messages = db.GetCollection<Message>("Messages");
        }
        public async Task<Message> AddMessage(Message message)
        {
            await _messages.InsertOneAsync(message);
            return message;
        }

        public async Task<List<Message>> GetMessagesBetweenUsers(string user1Id, string user2Id)
        {
            var filter = Builders<Message>.Filter.Or(
                Builders<Message>.Filter.And(
                    Builders<Message>.Filter.Eq(m => m.SenderId, user1Id),
                    Builders<Message>.Filter.Eq(m => m.ReceiverId, user2Id)
                ),
                Builders<Message>.Filter.And(
                    Builders<Message>.Filter.Eq(m => m.SenderId, user2Id),
                    Builders<Message>.Filter.Eq(m => m.ReceiverId, user1Id)
                )
            );
            return await _messages.Find(filter)
                .SortBy(m => m.SentAt)
                .ToListAsync();
        }

        public async Task<List<Message>> GetMessagesForUser(string userId)
        {
            var filter = Builders<Message>.Filter.Or(
                Builders<Message>.Filter.Eq(m => m.SenderId, userId),
                Builders<Message>.Filter.Eq(m => m.ReceiverId, userId)
            );
            return await _messages.Find(filter).ToListAsync();
        }

        public async Task UpdateMessage(Message message)
        {
            var filter = Builders<Message>.Filter.Eq(m => m.Id, message.Id);
            await _messages.ReplaceOneAsync(filter, message);
        }

        public async Task MarkMessagesAsRead(string messageId)
        {
            var filter = Builders<Message>.Filter.And(
                Builders<Message>.Filter.Eq(m => m.Id, messageId),
                Builders<Message>.Filter.Eq(m => m.IsRead, false)
            );
            var update = Builders<Message>.Update.Set(m => m.IsRead, true);
            await _messages.UpdateManyAsync(filter, update);
        }

        public async Task MarkMessagesAsDelivered(string senderId, string receiverId)
        {
            var filter = Builders<Message>.Filter.And(
                Builders<Message>.Filter.Eq(m => m.SenderId, senderId),      
                Builders<Message>.Filter.Eq(m => m.ReceiverId, receiverId), 
                Builders<Message>.Filter.Eq(m => m.IsDelivered, false)
            );
            var update = Builders<Message>.Update.Set(m => m.IsDelivered, true);

            var result = await _messages.UpdateManyAsync(filter, update);
        }

        public async Task MarkAllMessagesAsDelivered(string receiverId)
        {
            var filter = Builders<Message>.Filter.And(
                Builders<Message>.Filter.Eq(m => m.ReceiverId, receiverId),  
                Builders<Message>.Filter.Eq(m => m.IsDelivered, false)
            );
            var update = Builders<Message>.Update.Set(m => m.IsDelivered, true);

            var result = await _messages.UpdateManyAsync(filter, update);
        }
    }
}