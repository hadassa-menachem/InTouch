using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace InTouch.Hubs
{
    public class MessageHub : Hub
    {
        // Dictionary לעקוב אחרי משתמשים מחוברים
        private static readonly ConcurrentDictionary<string, bool> _connectedUsers
            = new ConcurrentDictionary<string, bool>();

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                _connectedUsers.TryAdd(userId, true);
                Console.WriteLine($"✅ User {userId} connected. Total connected: {_connectedUsers.Count}");

                // ✅ תחילה שלח למשתמש החדש את רשימת כל המשתמשים המחוברים
                var connectedUsersList = _connectedUsers.Keys.ToList();
                await Clients.Caller.SendAsync("InitialConnectedUsers", connectedUsersList);
                Console.WriteLine($"📤 Sent {connectedUsersList.Count} connected users to {userId}");

                // ✅ אחר כך שדר לכל המשתמשים האחרים שמשתמש חדש התחבר
                await Clients.All.SendAsync("UserConnected", userId);
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                _connectedUsers.TryRemove(userId, out _);
                Console.WriteLine($"❌ User {userId} disconnected. Total connected: {_connectedUsers.Count}");

                // שידור לכל המשתמשים שיודעו שהמשתמש התנתק
                await Clients.All.SendAsync("UserDisconnected", userId);
            }
            await base.OnDisconnectedAsync(exception);
        }

        // מתודה לבדוק אם משתמש מחובר
        public static bool IsUserConnected(string userId)
        {
            return _connectedUsers.ContainsKey(userId);
        }
    }
}