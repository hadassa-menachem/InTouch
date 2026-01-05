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
        private readonly IMapper imapper;

        public MessageBll(IMessageDal dal, IMapper mapper)
        {
            _dal = dal;
            this.imapper = mapper;
        }
        public async Task<MessageDTO> AddMessage(MessageDTO dto)
        {
            var messageEntity = imapper.Map<Message>(dto);
            var savedMessage = await _dal.AddMessage(messageEntity);
            return imapper.Map<MessageDTO>(savedMessage);
        }

        public async Task UpdateMessage(MessageDTO dto)
        {
            var message = imapper.Map<Message>(dto);
            await _dal.UpdateMessage(message);
        }

        public async Task<List<MessageDTO>> GetMessagesBetweenUsers(string user1Id, string user2Id)
        {
            var messages = await _dal.GetMessagesBetweenUsers(user1Id, user2Id);
            return imapper.Map<List<MessageDTO>>(messages);
        }

        public async Task<List<MessageDTO>> GetMessagesForUser(string userId)
        {
            var messages = await _dal.GetMessagesForUser(userId);
            return imapper.Map<List<MessageDTO>>(messages);
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
