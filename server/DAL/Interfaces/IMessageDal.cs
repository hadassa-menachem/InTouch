using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IMessageDal
    {
        Task AddMessage(Message message);
        Task<List<Message>> GetMessagesBetweenUsers(string user1Id, string user2Id);
        Task<List<Message>> GetMessagesForUser(string userId);
        Task UpdateMessage(Message message);
        Task MarkMessagesAsRead(string messageId);
        Task MarkMessagesAsDelivered(string senderId, string receiverId);
        Task MarkAllMessagesAsDelivered(string receiverId);
    }
}
