using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Interfaces;
using DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class MessageBll : IMessageBll
    {
        private readonly IMessageDal _dal;
        private readonly IMapper _mapper;

        public MessageBll(IMessageDal dal, IMapper mapper)
        {
            _dal = dal;
            _mapper = mapper;
        }

        public async Task AddMessage(MessageDTO dto)
        {
            var message = _mapper.Map<Message>(dto);
            await _dal.AddMessage(message);
        }

        public async Task UpdateMessage(MessageDTO dto)
        {
            var message = _mapper.Map<Message>(dto);
            await _dal.UpdateMessage(message);
        }

        public async Task<List<MessageDTO>> GetMessagesBetweenUsers(string user1Id, string user2Id)
        {
            var messages = await _dal.GetMessagesBetweenUsers(user1Id, user2Id);
            return _mapper.Map<List<MessageDTO>>(messages);
        }

        public async Task<List<MessageDTO>> GetMessagesForUser(string userId)
        {
            var messages = await _dal.GetMessagesForUser(userId);
            return _mapper.Map<List<MessageDTO>>(messages);
        }

        public async Task MarkMessagesAsRead(string messageId)
        {
            await _dal.MarkMessagesAsRead(messageId);
        }

        public async Task MarkMessagesAsDelivered(string receiverId, string senderId)
        {
            await _dal.MarkMessagesAsDelivered(receiverId, senderId);
        }

        public async Task MarkAllMessagesAsDelivered(string receiverId)
        {
            await _dal.MarkAllMessagesAsDelivered(receiverId);
        }
    }
}
