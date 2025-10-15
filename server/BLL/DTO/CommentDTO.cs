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
        public string PostId { get; set; } // מזהה הפוסט
        public string UserId { get; set; } // מזהה המשתמש
        public string Content { get; set; } // תוכן התגובה (שמשתמשים בו בקונטרולר)
        public DateTime CreatedAt { get; set; } // תאריך התגובה
        public string UserName { get; set; } // שם המשתמש המגיב
    }
}

