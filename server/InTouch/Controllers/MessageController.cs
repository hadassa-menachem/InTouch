using BLL.DTO;
using BLL.Interfaces;
using InTouch.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace InTouch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly IMessageBll _messageBLL;
        private readonly IHubContext<MessageHub> _hubContext;

        public MessageController(IMessageBll messageBLL, IHubContext<MessageHub> hubContext)
        {
            _messageBLL = messageBLL;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] CreateMessageDTO dto)
        {
            var messageDto = new MessageDTO
            {
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                Content = dto.Content ?? "",
                SentAt = DateTime.Now,
                IsRead = false,
                IsDelivered = false
            };

            var savedMessage = await _messageBLL.AddMessage(messageDto);

            await _hubContext.Clients.User(dto.ReceiverId)
                .SendAsync("ReceiveMessage", savedMessage);

            await _hubContext.Clients.User(dto.SenderId)
                .SendAsync("ReceiveMessage", savedMessage);

            return Ok(savedMessage);
        }

        [HttpPost("send-with-file")]
        public async Task<IActionResult> SendMessageWithFile(
            [FromForm] CreateMessageWithFileDTO dto,
            IFormFile? image)
        {
            if (image != null && image.Length > 0)
            {
                var fileName = Guid.NewGuid() + Path.GetExtension(image.FileName);
                var uploadPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot/uploads/messages");

                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var filePath = Path.Combine(uploadPath, fileName);
                using var stream = new FileStream(filePath, FileMode.Create);
                await image.CopyToAsync(stream);

                dto.ImageUrl = $"/uploads/messages/{fileName}";
            }

            var messageDto = new MessageDTO
            {
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                Content = dto.Content ?? "",
                ImageUrl = dto.ImageUrl,
                SentAt = DateTime.Now,
                IsRead = false,
                IsDelivered = false
            };

            var savedMessage = await _messageBLL.AddMessage(messageDto);

            await _hubContext.Clients.User(dto.ReceiverId)
                .SendAsync("ReceiveMessage", savedMessage);

            await _hubContext.Clients.User(dto.SenderId)
                .SendAsync("ReceiveMessage", savedMessage);

            return Ok(savedMessage);
        }

        [HttpGet("between/{user1Id}/{user2Id}")]
        public async Task<ActionResult<List<MessageDTO>>> GetConversation(
            string user1Id, string user2Id)
        {
            var messages = await _messageBLL
                .GetMessagesBetweenUsers(user1Id, user2Id);

            return Ok(messages);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<MessageDTO>>> GetAllMessagesForUser(string userId)
        {
            var messages = await _messageBLL.GetMessagesForUser(userId);
            return Ok(messages);
        }

        [HttpPost("mark-as-read")]
        public async Task<IActionResult> MarkMessagesAsRead([FromBody] MessageDTO dto)
        {
            await _messageBLL.MarkMessagesAsRead(dto.Id);

            await _hubContext.Clients.User(dto.SenderId)
                .SendAsync("MessageRead", new
                {
                    messageId = dto.Id,
                    isRead = true
                });

            return Ok();
        }

        [HttpPost("mark-as-delivered")]
        public async Task<IActionResult> MarkMessagesAsDelivered([FromBody] MarkAsReadDTO dto)
        {
            await _messageBLL.MarkMessagesAsDelivered(dto.SenderId, dto.ReceiverId);

            await _hubContext.Clients.User(dto.SenderId)
                .SendAsync("MessagesDelivered", new
                {
                    senderId = dto.SenderId,
                    receiverId = dto.ReceiverId
                });

            return Ok();
        }

        [HttpPost("mark-all-delivered")]
        public async Task<IActionResult> MarkAllMessagesAsDelivered(
            [FromBody] MarkAllAsDeliveredDTO dto)
        {
            await _messageBLL.MarkAllMessagesAsDelivered(dto.ReceiverId);

            Console.WriteLine($"📡 Broadcasting AllMessagesDelivered event to ALL users");
            await _hubContext.Clients.All
                .SendAsync("AllMessagesDelivered", new
                {
                    receiverId = dto.ReceiverId
                });

            return Ok();
        }
    }
}