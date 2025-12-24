using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IAiServiceDal
    {
        Task<string> SummarizePostAsync(string text);
        Task<string> AnalyzeToneAsync(string text);
    }
}
