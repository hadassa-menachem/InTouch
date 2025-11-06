using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class FollowDTO
    {
        public string? Id { get; set; } 
        public string? FollowerId { get; set; }
        public string? FolloweeId { get; set; }
        public DateTime? FollowedAt { get; set; }
    }

}
