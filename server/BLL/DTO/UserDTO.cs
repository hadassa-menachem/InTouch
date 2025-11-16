using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class UserDTO
    {
        public string UserId { get; set; }
        public string? UserName { get; set; } = "";
        public string? FirstName { get; set; } = "";
        public string? LastName { get; set; } = "";
        public DateTime? DateOfBirth { get; set; } = DateTime.Now;
        public string? Gender { get; set; } = "";
        public string? Phone { get; set; } = "";
        public string? Email { get; set; } = "";
        public string? Password { get; set; } = "";
        public string? Bio { get; set; } = "";
        public DateTime? CreatedAt { get; set; }
        public string? profilePicUrl { get; set; } = "";
        public List<MediaFile>? MediaFiles { get; set; } = null; 
        public List<string>? FollowingsList { get; set; } = null;// רשימת משתמשים שהמשתמש עוקב אחריהם
        public List<string>? FollowersList { get; set; } = null;// רשימת משתמשים שעקובים אחרי המשתשמש
        public int? FollowingCount => FollowingsList?.Count ?? 0;
        public int? FollowersCount => FollowersList?.Count ?? 0;
        public int? PostsCount => MediaFiles?.Count ?? 0;
    }
}
