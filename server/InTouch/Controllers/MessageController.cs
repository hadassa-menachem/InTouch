using BLL.DTO;
using BLL.Interfaces;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;

namespace InTouch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly IMessageBll _messageBLL;

        public MessageController(IMessageBll messageBLL)
        {
            _messageBLL = messageBLL;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] CreateMessageDTO dto)
        {
            var message = new Message
            {
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                Content = dto.Content
            };

            await _messageBLL.AddMessage(message);
            return Ok();
        }

        [HttpPost("send-with-file")]
        public async Task<IActionResult> SendMessageWithFile([FromForm] CreateMessageWithFileDTO dto, IFormFile? image)
        {
            var imageUrl = string.Empty;

            if (image != null && image.Length > 0)
            {
                var fileName = Guid.NewGuid() + Path.GetExtension(image.FileName);
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/messages");

                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                imageUrl = $"/uploads/messages/{fileName}";
            }

            var message = new Message
            {
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                Content = dto.Content ?? string.Empty,
                SentAt = DateTime.Now,
                ImageUrl = imageUrl
            };

            await _messageBLL.AddMessage(message);

            return Ok(message);
        }


        [HttpGet("between/{user1Id}/{user2Id}")]
        public async Task<ActionResult<List<Message>>> GetConversation(string user1Id, string user2Id)
        {
            var messages = await _messageBLL.GetMessagesBetweenUsers(user1Id, user2Id);
            return Ok(messages); 
        }


        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Message>>> GetAllMessagesForUser(string userId)
        {
            var messages = await _messageBLL.GetMessagesForUser(userId);
            return Ok(messages);
        }
        [HttpPost("mark-as-read")]
        public async Task<IActionResult> MarkMessagesAsRead(MessageDTO dto)
        {
            await _messageBLL.MarkMessagesAsRead(dto.Id);
            return Ok();
        }
        [HttpPost("mark-as-delivered")]
        public async Task<IActionResult> MarkMessagesAsDelivered([FromBody] MarkAsReadDTO dto)
        {
            await _messageBLL.MarkMessagesAsDelivered(dto.SenderId, dto.ReceiverId);
            return Ok();
        }
        [HttpPost("mark-all-delivered")]
        public async Task<IActionResult> MarkAllMessagesAsDelivered([FromBody] MarkAllAsDeliveredDTO dto)
        {
            await _messageBLL.MarkAllMessagesAsDelivered(dto.ReceiverId);
            return Ok();
        }
    }
}
