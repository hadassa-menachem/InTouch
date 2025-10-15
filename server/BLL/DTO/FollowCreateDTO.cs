using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class FollowRequestDTO
    {
        public string FolloweeId { get; set; } // הנעקב
        public string FollowerId { get; set; } // העוקב
        public DateTime? FollowedAt { get; set; } 
    }
}
