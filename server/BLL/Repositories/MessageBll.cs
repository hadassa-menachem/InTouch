using AutoMapper;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using DAL.Repositories;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class MessageBll : IMessageBll
    {
        private readonly IMessageDal _idal;
        private readonly IMapper _imapper;

        public MessageBll(IMessageDal idal, IMapper imapper)
        {
            _idal = idal;
            _imapper = imapper;
        }

        public async Task AddMessage(Message message)
        {
            await _idal.AddMessage(message);
        }
        public async Task UpdateMessage(Message message)
        {
            await _idal.UpdateMessage(message);
        }

        public async Task<List<Message>> GetMessagesBetweenUsers(string user1Id, string user2Id)
        {
            return await _idal.GetMessagesBetweenUsers(user1Id, user2Id);
        }

        public async Task<List<Message>> GetMessagesForUser(string userId)
        {
            return await _idal.GetMessagesForUser(userId);
        }
        public async Task MarkMessagesAsRead(string messageId)
        {
            await _idal.MarkMessagesAsRead(messageId);
        }
        public async Task MarkMessagesAsDelivered(string receiverId, string senderId)
        {
            await _idal.MarkMessagesAsDelivered(receiverId, senderId);
        }
        public async Task MarkAllMessagesAsDelivered(string receiverId)
        {
            await _idal.MarkAllMessagesAsDelivered(receiverId);
        }

    }
}
