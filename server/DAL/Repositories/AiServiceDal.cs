using DAL.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class AiServiceDal : IAiServiceDal
    {
        private readonly HttpClient _httpClient;

        public AiServiceDal(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            var apiKey = configuration["AiService:ApiKey"];
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
        }

        public async Task<string> SummarizePostAsync(string text)
        {
            var requestBody = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "system", content = "Confine the text to just one line, like a title" },
                    new { role = "user", content = text }
                }
            };

            return await SendRequestAsync(requestBody);
        }

        public async Task<string> AnalyzeToneAsync(string text)
        {
            var requestBody = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "system", content = "Determine whether the tone is positive, negative, or neutral" },
                    new { role = "user", content = text }
                }
            };

            return await SendRequestAsync(requestBody);
        }

        private async Task<string> SendRequestAsync(object body)
        {
            try
            {
                var json = JsonSerializer.Serialize(body);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(
                    "https://api.openai.com/v1/chat/completions",
                    content
                );

                response.EnsureSuccessStatusCode();

                var responseJson = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseJson);

                var choices = doc.RootElement.GetProperty("choices");
                if (choices.GetArrayLength() == 0) return string.Empty;

                return choices[0].GetProperty("message")
                                .GetProperty("content")
                                .GetString() ?? string.Empty;
            }
            catch (HttpRequestException ex)
            {
                // אפשר לוג או להחזיר הודעת שגיאה מותאמת
                return $"Error contacting AI service: {ex.Message}";
            }
        }
    }
}
