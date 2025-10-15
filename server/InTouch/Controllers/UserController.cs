using BLL.DTO;
using BLL.Functions;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserBll _userBll;

    public UserController(UserBll userBll)
    {
        _userBll = userBll;
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
        var user = await _userBll.GetUserByUserName(userName);
        if (user == null)
            return NotFound();
        return Ok(user);
    }

    // POST api/user
    [HttpPost]
    [RequestSizeLimit(20_000_000)] // מגבלת גודל קובץ 10MB לדוגמה
    public async Task<ActionResult> addUser([FromForm] CreateUserDTO dto, IFormFile? profileImage)
    {
        var user = new User
        {
            UserId = dto.UserId!, // יצירת ID חדש אם לא סופק
            UserName = dto.UserName,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Phone = dto.Phone,
            Email = dto.Email,
            Password = dto.Password,
            Bio = dto.Bio,
            CreatedAt = DateTime.UtcNow,
            FollowingsList = new List<string>(),
            FollowersList = new List<string>(),
            MediaFiles = new List<MediaFile>()
        };

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
            user.profilePicUrl = imageUrl;
        }

        await _userBll.AddUser(user);
        return CreatedAtAction(nameof(GetUserById), new { id = user.UserId }, user);
    }




    // PUT api/user/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateUser(string id, [FromForm] UpdateUserDTO dto, IFormFile? profileImage)
    {
        var existingUser = await _userBll.GetUserById(id);
        if (existingUser == null)
            return NotFound();

        // עדכון שדות מה-DTO
        existingUser.UserName = dto.UserName;
        existingUser.FirstName = dto.FirstName;
        existingUser.LastName = dto.LastName;
        existingUser.DateOfBirth = dto.DateOfBirth;
        existingUser.Gender = dto.Gender;
        existingUser.Phone = dto.Phone;
        existingUser.Email = dto.Email;
        existingUser.Password = dto.Password;
        existingUser.Bio = dto.Bio;
        // שאר השדות נשארים כמו שהם

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
            existingUser.profilePicUrl = imageUrl;
        }

        await _userBll.UpdateUser(id, existingUser);

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
