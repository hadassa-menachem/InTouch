using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class MarkAsReadDTO
    {
        public string SenderId { get; set; } = null!;
        public string ReceiverId { get; set; } = null!;
    }
}
