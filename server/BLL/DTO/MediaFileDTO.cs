using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class MediaFileDTO
    {
        public string Id { get; set; }
        public string Url { get; set; }
        public string MediaType { get; set; }
        public DateTime UploadedAt { get; set; }
        public string? PostId { get; set; }
    }
}
