using AutoMapper;
using BLL.DTO;
using BLL.Repositories;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class FollowController : ControllerBase
{
    private readonly FollowBll _followBll;

    private readonly IMapper _mapper;

    public FollowController(FollowBll followBll, IMapper mapper)
    {
        _followBll = followBll;
        _mapper = mapper;
    }


    // GET api/follow
    [HttpGet]
    public async Task<ActionResult<List<Follow>>> GetAllFollows()
    {
        var follows = await _followBll.GetAllFollows();
        return Ok(follows);
    }

    // GET api/follow/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Follow>> GetFollowById(string id)
    {
        var follow = await _followBll.GetFollowById(id);
        if (follow == null)
            return NotFound();
        return Ok(follow);
    }

    // GET api/follow/followers/{userId}
    [HttpGet("followers/{userId}")]
    public async Task<ActionResult<List<Follow>>> GetFollowersByUserId(string userId)
    {
        var followers = await _followBll.GetFollowersByUserId(userId);
        return Ok(followers);
    }

    // GET api/follow/followees/{userId}
    [HttpGet("followees/{userId}")]
    public async Task<ActionResult<List<Follow>>> GetFolloweesByUserId(string userId)
    {
        var followees = await _followBll.GetFolloweesByUserId(userId);
        return Ok(followees);
    }

    // POST api/follow
    [HttpPost]
    public async Task<ActionResult> AddFollow([FromBody] FollowRequestDTO followDto)
    {
        var existingFollows = await _followBll.GetFollowersByUserId(followDto.FolloweeId);
        if (existingFollows.Any(f => f.FollowerId == followDto.FollowerId && f.FolloweeId == followDto.FolloweeId))
            return BadRequest("המעקב כבר קיים");

        var follow = _mapper.Map<Follow>(followDto);
        await _followBll.AddFollow(follow);
        return CreatedAtAction(nameof(GetFollowById), new { id = follow.Id }, follow);
    }


    // DELETE api/follow/by-users?followerId=123&followeeId=456
    [HttpDelete("by-users")]
    public async Task<ActionResult> DeleteFollowByUsers([FromQuery] string followerId, [FromQuery] string followeeId)
    {
        var follows = await _followBll.GetFolloweesByUserId(followerId);
        var follow = follows.FirstOrDefault(f => f.FolloweeId == followeeId);

        if (follow == null)
            return NotFound("המעקב לא קיים");

        await _followBll.DeleteFollow(follow.Id);
        return NoContent();
    }

    // PUT api/follow/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateFollow(string id, Follow updatedFollow)
    {
        var existingFollow = await _followBll.GetFollowById(id);
        if (existingFollow == null)
            return NotFound();

        await _followBll.UpdateFollow(id, updatedFollow);
        return NoContent();
    }

    // DELETE api/follow/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteFollow(string id)
    {
        var existingFollow = await _followBll.GetFollowById(id);
        if (existingFollow == null)
            return NotFound();

        await _followBll.DeleteFollow(id);
        return NoContent();
    }
    [HttpGet("is-following")]
    public async Task<ActionResult<bool>> IsFollowing([FromQuery] string followerId, [FromQuery] string followeeId)
    {
        var follows = await _followBll.GetFolloweesByUserId(followerId);
        bool isFollowing = follows.Any(f => f.FolloweeId == followeeId);
        return Ok(isFollowing);
    }

}
