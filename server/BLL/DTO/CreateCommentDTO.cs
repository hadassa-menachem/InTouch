﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class CreateCommentDTO
    {
        public string PostId { get; set; }
        public string UserId { get; set; }
        public string Content { get; set; }
    }
}
