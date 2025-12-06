using AutoMapper;
using BLL.DTO;
using BLL.Functions;
using BLL.Interfaces;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InTouch.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserBll _userBll;
        private readonly IMapper _mapper; 

        public UserController(IUserBll userBll, IMapper mapper)
        {
            _userBll = userBll;
            _mapper = mapper;
        }

        // GET api/user
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetAllUsers()
        {
            var users = await _userBll.GetAllUsers();
            return Ok(users);
        }

        // GET api/user/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById(string id)
        {
            var user = await _userBll.GetUserById(id);
            if (user == null)
                return NotFound();
            return Ok(user);
        }

        // GET api/user/username/{userName}
        [HttpGet("username/{userName}")]
        public async Task<ActionResult<User>> GetUserByUserName(string userName)
        {
            var user = await _userBll.GetUserByUsername(userName);
            if (user == null)
                return NotFound();
            return Ok(user);
        }

        // POST api/user
        [HttpPost]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult> addUser([FromForm] UserDTO dto, IFormFile? profileImage)
        {
            var user = _mapper.Map<User>(dto);

            if (profileImage != null && profileImage.Length > 0)
            {
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsPath))
                    Directory.CreateDirectory(uploadsPath);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(profileImage.FileName);
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await profileImage.CopyToAsync(stream);
                }

                var imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
                user.ProfilePicUrl = imageUrl;
                user.SavedPosts = new List<SavedPost>();
            }

            var userDtoForBll = _mapper.Map<UserDTO>(user);
            await _userBll.AddUser(userDtoForBll);

            return CreatedAtAction(nameof(GetUserById), new { id = user.UserId }, user);
        }

        // PUT api/user/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(string id, [FromForm] UpdateUserDTO dto, IFormFile? profileImage)
        {
            var existingUser = await _userBll.GetUserById(id);
            if (existingUser == null)
                return NotFound();

            if (profileImage != null && profileImage.Length > 0)
            {
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsPath))
                    Directory.CreateDirectory(uploadsPath);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(profileImage.FileName);
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await profileImage.CopyToAsync(stream);
                }

                var imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";

                dto.profilePicUrl = imageUrl;
            }

            await _userBll.UpdateUser(id, dto);

            return NoContent();
        }


        // DELETE api/user/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            var existingUser = await _userBll.GetUserById(id);
            if (existingUser == null)
                return NotFound();

            await _userBll.DeleteUser(id);
            return NoContent();
        }
    }
}