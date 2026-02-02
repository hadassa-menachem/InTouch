using DAL.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
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
            var apiKey = configuration["AiService:GroqApiKey"];

            // ✅ הדרך הנכונה להגדיר Authorization
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", apiKey);
        }

        public async Task<string> SummarizePostAsync(string text)
        {
            if (text.Length > 1000)
                text = text.Substring(0, 1000) + "...";

            var requestBody = new
            {
                model = "llama-3.3-70b-versatile",
                messages = new[]
                {
                    new { role = "system", content = "You are a helpful assistant that creates short, catchy titles. Respond with only the title include emoji, nothing else." },
                    new { role = "user", content = $"Create a short, engaging title (max 10 words) for this post:\n\n{text}" }
                },
                temperature = 0.7,
                max_tokens = 50
            };

            return await SendRequestAsync(requestBody);
        }

        public async Task<string> AnalyzeToneAsync(string text)
        {
            if (text.Length > 1000)
                text = text.Substring(0, 1000) + "...";

            var requestBody = new
            {
                model = "llama-3.3-70b-versatile",
                messages = new[]
                {
                    new { role = "system", content = "You are a tone analyzer. Respond with only one word: 'Positive', 'Negative', or 'Neutral'." },
                    new { role = "user", content = $"Analyze the tone of this text:\n\n{text}" }
                },
                temperature = 0.3,
                max_tokens = 10
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
                    "https://api.groq.com/openai/v1/chat/completions",
                    content
                );

                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"❌ Error: {response.StatusCode}");
                    Console.WriteLine($"❌ Response: {responseBody}");
                    return "Unable to generate summary. Please try again.";
                }

                Console.WriteLine($"✅ Success! Response: {responseBody}");

                using var doc = JsonDocument.Parse(responseBody);
                var choices = doc.RootElement.GetProperty("choices");

                if (choices.GetArrayLength() == 0)
                    return "No response generated.";

                var messageContent = choices[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? string.Empty;

                return messageContent.Trim();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"❌ HTTP Error: {ex.Message}");
                return "Service temporarily unavailable.";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Unexpected error: {ex.Message}");
                return "An error occurred.";
            }
        }
    }
}