using Microsoft.AspNetCore.SignalR;

namespace InTouch.Hubs
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            var userId = connection.GetHttpContext()?.Request.Query["userId"].ToString();

            if (string.IsNullOrEmpty(userId))
            {
                return null;
            }
            return userId;
        }
    }
}