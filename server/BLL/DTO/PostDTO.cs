using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class PostDTO
    {
        public string Id { get; set; }
        public string Content { get; set; }
        public string UserName { get; set; } = "";
        public List<MediaFileDTO> MediaFiles { get; set; } = new();
        public List<LikeDTO> Likes { get; set; } = new List<LikeDTO>();
        public List<CommentDTO> Comments { get; set; } = new List<CommentDTO>();
        public UserDTO? User { get; set; } 
    }
}
