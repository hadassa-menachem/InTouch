using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class FollowDTO
    {
        public string? CodeUser { get; set; }
        public string? UserName { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Bio { get; set; }
        public int FollowingCount { get; set; }
        public int FollowersCount { get; set; }
        public int PostsCount { get; set; }
    }
}
