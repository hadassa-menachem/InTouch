﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class CreateMessageWithFileDTO
    {
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string Content { get; set; }
    }
}
