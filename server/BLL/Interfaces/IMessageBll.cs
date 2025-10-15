using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IMessageBll
    {
        Task AddMessage(Message message);
        Task<List<Message>> GetMessagesBetweenUsers(string user1Id, string user2Id);
        Task<List<Message>> GetMessagesForUser(string userId);
        Task MarkMessagesAsRead(string messageId);
        Task UpdateMessage(Message message);
        Task MarkMessagesAsDelivered(string receiverId, string senderId);
        Task MarkAllMessagesAsDelivered(string receiverId);

    }
}
