using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class LikeDTO
    {
        public string Id { get; set; }
        public string PostId { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; } = "";
    }

}
