using BLL.DTO;
using BLL.Interfaces;
using BLL.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class FollowController : ControllerBase
{
    private readonly IFollowBll _followBll;

    public FollowController(IFollowBll followBll)
    {
        _followBll = followBll;
    }

    // GET: api/follow
    [HttpGet]
    public async Task<ActionResult<List<FollowDTO>>> GetAllFollows()
    {
        var follows = await _followBll.GetAllFollows();
        return Ok(follows);
    }

    // GET: api/follow/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<FollowDTO>> GetFollowById(string id)
    {
        var follow = await _followBll.GetFollowById(id);
        if (follow == null)
            return NotFound();
        return Ok(follow);
    }

    // GET: api/follow/followers/{userId}
    [HttpGet("followers/{userId}")]
    public async Task<ActionResult<List<FollowDTO>>> GetFollowersByUserId(string userId)
    {
        var followers = await _followBll.GetFollowersByUserId(userId);
        return Ok(followers);
    }

    // GET: api/follow/followees/{userId}
    [HttpGet("followees/{userId}")]
    public async Task<ActionResult<List<FollowDTO>>> GetFolloweesByUserId(string userId)
    {
        var followees = await _followBll.GetFolloweesByUserId(userId);
        return Ok(followees);
    }

    // POST: api/follow
    [HttpPost]
    public async Task<ActionResult> AddFollow([FromBody] FollowDTO followDto)
    {
        // בדיקה אם המעקב כבר קיים
        var existingFollows = await _followBll.GetFollowersByUserId(followDto.FolloweeId);
        if (existingFollows.Any(f => f.FollowerId == followDto.FollowerId && f.FolloweeId == followDto.FolloweeId))
            return BadRequest("המעקב כבר קיים");

        await _followBll.AddFollow(followDto);
        return CreatedAtAction(nameof(GetFollowById), new { id = followDto.CodeUser }, followDto);
    }

    // PUT: api/follow/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateFollow(string id, [FromBody] FollowDTO updatedFollowDto)
    {
        var existingFollow = await _followBll.GetFollowById(id);
        if (existingFollow == null)
            return NotFound();

        await _followBll.UpdateFollow(id, updatedFollowDto);
        return NoContent();
    }

    // DELETE: api/follow/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteFollow(string id)
    {
        var existingFollow = await _followBll.GetFollowById(id);
        if (existingFollow == null)
            return NotFound();

        await _followBll.DeleteFollow(id);
        return NoContent();
    }

    // DELETE: api/follow/by-users?followerId=123&followeeId=456
    [HttpDelete("by-users")]
    public async Task<ActionResult> DeleteFollowByUsers([FromQuery] string followerId, [FromQuery] string followeeId)
    {
        var followees = await _followBll.GetFolloweesByUserId(followerId);
        var follow = followees.FirstOrDefault(f => f.FolloweeId == followeeId);

        if (follow == null)
            return NotFound("המעקב לא קיים");

        await _followBll.DeleteFollow(follow.CodeUser);
        return NoContent();
    }

    // GET: api/follow/is-following?followerId=123&followeeId=456
    [HttpGet("is-following")]
    public async Task<ActionResult<bool>> IsFollowing([FromQuery] string followerId, [FromQuery] string followeeId)
    {
        var followees = await _followBll.GetFolloweesByUserId(followerId);
        bool isFollowing = followees.Any(f => f.FolloweeId == followeeId);
        return Ok(isFollowing);
    }
}
