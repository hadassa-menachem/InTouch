using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InTouch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SavedPostController : ControllerBase
    {
        private readonly ISavedPostBll _savedPostBll;

        public SavedPostController(ISavedPostBll savedPostBll)
        {
            _savedPostBll = savedPostBll;
        }

        [HttpPost]
        public async Task<IActionResult> SavePost([FromBody] SavedPostDTO dto)
        {
            await _savedPostBll.SavePost(dto);
            return Ok("The post was saved successfully");
        }

        [HttpDelete("{userId}/{postId}")]
        public async Task<IActionResult> UnsavePost(string userId, string postId)
        {
            var result = await _savedPostBll.UnsavePost(userId, postId);
            if (!result)
                return NotFound(new { message = "The post to remove was not found" });

            return Ok(new { message = "The post was successfully removed from the list" });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetSavedPosts(string userId)
        {
            var savedPosts = await _savedPostBll.GetSavedPostsByUserId(userId);
            return Ok(savedPosts);
        }

        [HttpGet("is-saved/{userId}/{postId}")]
        public async Task<IActionResult> IsSavedPost(string userId, string postId)
        {
            var isSaved = await _savedPostBll.IsSavedPost(userId, postId);
            return Ok(isSaved);
        }
    }
}
