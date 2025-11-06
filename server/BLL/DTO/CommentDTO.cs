using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class CommentDTO
    {
        public string Id { get; set; }
        public string PostId { get; set; } 
        public string UserId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } 
        public string UserName { get; set; } 
    }
}

