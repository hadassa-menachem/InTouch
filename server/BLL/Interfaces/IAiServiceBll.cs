using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IAiServiceBll
    {
        Task<string> SummarizePostAsync(string text);
        Task<string> AnalyzeToneAsync(string text);
    }
}