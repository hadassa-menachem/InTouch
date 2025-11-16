using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InTouch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LikeController : ControllerBase
    {
        private readonly ILikeBll _likeBll;

        public LikeController(ILikeBll likeBll)
        {
            _likeBll = likeBll;
        }

        [HttpPost]
        public async Task<IActionResult> AddLike([FromBody] LikeDTO likeDto)
        {
            if (likeDto == null)
            {
                return BadRequest(new { message = "Request body is null or empty" });
            }

            if (string.IsNullOrWhiteSpace(likeDto.PostId))
            {
                return BadRequest(new { message = "PostId is required" });
            }

            if (string.IsNullOrWhiteSpace(likeDto.UserId))
            {
                return BadRequest(new { message = "UserId is required" });
            }

            try
            {
                var result = await _likeBll.AddLike(likeDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, type = ex.GetType().Name });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteLike([FromQuery] string postId, [FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(postId) || string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { message = "PostId and UserId are required" });
            }

            try
            {
                await _likeBll.DeleteLikeByUserAndPost(postId, userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("not found"))
                    return NotFound(new { message = "Like not found" });

                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("isliked")]
        public async Task<ActionResult<bool>> IsPostLikedByUser([FromQuery] string postId, [FromQuery] string userId)
        {
            var isLiked = await _likeBll.IsPostLikedByUser(postId, userId);
            return Ok(isLiked);
        }

        [HttpGet("post/{postId}")]
        public async Task<ActionResult<List<LikeDTO>>> GetLikesByPostId(string postId)
        {
            try
            {
                var likes = await _likeBll.GetLikesByPostId(postId);
                if (likes == null || likes.Count == 0)
                    return NotFound("No likes found for this post.");

                return Ok(likes);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}