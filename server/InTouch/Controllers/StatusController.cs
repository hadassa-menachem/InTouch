using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using DAL.Models;
using DAL.Repositories;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InTouch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusController : ControllerBase
    {
        private readonly IStatusBll _statusBll;
        private readonly IMapper _mapper;
        private readonly IMongoCollection<User> _userCollection;
        private readonly IWebHostEnvironment _env;

        public StatusController(IStatusBll statusBll,IMongoDatabase database, IMapper mapper, IWebHostEnvironment env)
        {
            _statusBll = statusBll;
            _mapper = mapper;
            _userCollection = database.GetCollection<User>("User");
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<List<Status>>> GetAllStatuses()
        {
            var statuses = await _statusBll.GetAllStatuses();
            return Ok(statuses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Status>> GetStatusById(string id)
        {
            var status = await _statusBll.GetStatusById(id);
            if (status == null) return NotFound();
            return Ok(status);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Status>>> GetStatusesByUserId(string userId)
        {
            var statuses = await _statusBll.GetStatusesByUserId(userId);
            return Ok(statuses);
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        public async Task<ActionResult> AddStatus([FromForm] CreateStatusDTO dto, IFormFile? file)
        {
            var user = await _userCollection.Find(u => u.UserId == dto.UserId).FirstOrDefaultAsync();
            if (user == null)
                return BadRequest("User not found");

            var status = new Status
            {
                Id = ObjectId.GenerateNewId().ToString(),
                UserId = dto.UserId,
                User = user,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            if (file != null && file.Length > 0)
            {
                var uploadsPath = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsPath))
                    Directory.CreateDirectory(uploadsPath);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                status.ImageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
            }

            await _statusBll.AddStatus(status);
            return CreatedAtAction(nameof(GetStatusById), new { id = status.Id }, status);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateStatus(string id, [FromBody] Status updatedStatus)
        {
            var existingStatus = await _statusBll.GetStatusById(id);
            if (existingStatus == null) return NotFound();

            await _statusBll.UpdateStatus(id, updatedStatus);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteStatus(string id)
        {
            var existingStatus = await _statusBll.GetStatusById(id);
            if (existingStatus == null) return NotFound();

            await _statusBll.DeleteStatus(id);
            return NoContent();
        }
    }
}
