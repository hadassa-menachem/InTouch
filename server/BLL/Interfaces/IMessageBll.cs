using BLL.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IMessageBll
    {
        Task AddMessage(MessageDTO messageDto);
        Task UpdateMessage(MessageDTO messageDto);
        Task<List<MessageDTO>> GetMessagesBetweenUsers(string user1Id, string user2Id);
        Task<List<MessageDTO>> GetMessagesForUser(string userId);
        Task MarkMessagesAsRead(string messageId);
        Task MarkMessagesAsDelivered(string receiverId, string senderId);
        Task MarkAllMessagesAsDelivered(string receiverId);
    }
}
