using AutoMapper;
using BLL.DTO;
using BLL.Interfaces;
using BLL.Repositories;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InTouch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentBll _commentBll;

        public CommentController(ICommentBll commentBll)
        {
            _commentBll = commentBll;
        }

        // GET: api/comment
        [HttpGet]
        public async Task<ActionResult<List<CommentDTO>>> GetAllComments()
        {
            var comments = await _commentBll.GetAllComments();
            return Ok(comments);
        }

        // GET: api/comment/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CommentDTO>> GetCommentById(string id)
        {
            var comment = await _commentBll.GetCommentById(id);
            if (comment == null) return NotFound();
            return Ok(comment);
        }

        // GET: api/comment/post/{postId}
        [HttpGet("post/{postId}")]
        public async Task<ActionResult<List<CommentDTO>>> GetCommentsByPostId(string postId)
        {
            var comments = await _commentBll.GetCommentsByPostId(postId);
            return Ok(comments);
        }

        // POST: api/comment
        [HttpPost]
        public async Task<ActionResult<CommentDTO>> AddComment([FromBody] CommentDTO commentDto)
        {
            if (commentDto == null || string.IsNullOrWhiteSpace(commentDto.Content))
                return BadRequest("an empty comment");

            var createdCommentDto = await _commentBll.AddComment(commentDto);

            return Ok(createdCommentDto);
        }

        // PUT: api/comment/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateComment(string id, [FromBody] CommentDTO commentDto)
        {
            await _commentBll.UpdateComment(id, commentDto);
            return NoContent();
        }

        // DELETE: api/comment/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteComment(string id)
        {
            await _commentBll.DeleteComment(id);
            return NoContent();
        }
    }
}
