using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class MessageDTO
    {
        public string Id { get; set; } = string.Empty;
        public string SenderId { get; set; } = string.Empty;
        public string ReceiverId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public string? SenderName { get; set; }
        public string? ImageUrl { get; set; } 
        public bool IsRead { get; set; } 
        public bool IsDelivered { get; set; }
    }
}
