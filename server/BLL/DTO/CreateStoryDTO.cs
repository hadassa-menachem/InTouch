using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class CreateStoryDTO
    {
        public string UserId { get; set; }
        public string? Content { get; set; }
        public string? Category { get; set; }
        public bool IsTemporary { get; set; }
        public string? ImageUrl { get; set; }
    }
}


