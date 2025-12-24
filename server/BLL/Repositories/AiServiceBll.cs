using BLL.Interfaces;
using DAL.Interfaces;
using BLL.Interfaces;
using DAL.Interfaces;
using System.Threading.Tasks;

namespace BLL.Repositories
{
    public class AiServiceBll : IAiServiceBll
    {
        private readonly IAiServiceDal _aiServiceDal;

        public AiServiceBll(IAiServiceDal aiServiceDal)
        {
            _aiServiceDal = aiServiceDal;
        }

        public async Task<string> SummarizePostAsync(string text)
        {
            return await _aiServiceDal.SummarizePostAsync(text);
        }

        public async Task<string> AnalyzeToneAsync(string text)
        {
            return await _aiServiceDal.AnalyzeToneAsync(text);
        }
    }
}