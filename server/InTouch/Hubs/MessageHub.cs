using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace InTouch.Hubs
{
    public class MessageHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            await base.OnDisconnectedAsync(exception);
        }
    }
}