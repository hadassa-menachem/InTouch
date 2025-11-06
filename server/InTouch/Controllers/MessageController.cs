using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
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

        public MessageController(IMessageBll messageBLL)
        {
            _messageBLL = messageBLL;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] CreateMessageDTO dto)
        {
            var messageDto = new MessageDTO
            {
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                Content = dto.Content ?? string.Empty,
                SentAt = DateTime.Now
            };

            await _messageBLL.AddMessage(messageDto);
            return Ok(messageDto);
        }

        [HttpPost("send-with-file")]
        public async Task<IActionResult> SendMessageWithFile([FromForm] CreateMessageWithFileDTO dto, IFormFile? image)
        {
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

                dto.ImageUrl = $"/uploads/messages/{fileName}";
            }

            var messageDto = new MessageDTO
            {
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                Content = dto.Content ?? string.Empty,
                ImageUrl = dto.ImageUrl,
                SentAt = DateTime.Now
            };

            await _messageBLL.AddMessage(messageDto);
            return Ok(messageDto);
        }

        [HttpGet("between/{user1Id}/{user2Id}")]
        public async Task<ActionResult<List<MessageDTO>>> GetConversation(string user1Id, string user2Id)
        {
            var messages = await _messageBLL.GetMessagesBetweenUsers(user1Id, user2Id);
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
            return Ok();
        }

        [HttpPost("mark-as-delivered")]
        public async Task<IActionResult> MarkMessagesAsDelivered([FromBody] MarkAsReadDTO dto)
        {
            await _messageBLL.MarkMessagesAsDelivered(dto.ReceiverId, dto.SenderId);
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
