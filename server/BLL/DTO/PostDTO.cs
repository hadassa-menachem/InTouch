using System;
using System.Collections.Generic;

namespace BLL.DTO
{
    public class PostDTO
    {
        public string? Id { get; set; }
        public string UserId { get; set; } = "";
        public string Content { get; set; } = "";
        public List<MediaFileDTO> MediaFiles { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<CommentDTO>? Comments { get; set; } = new();
        public List<LikeDTO>? Likes { get; set; } = new(); 
        public string? UserName { get; set; }
        public UserDTO? User { get; set; }
    }
}