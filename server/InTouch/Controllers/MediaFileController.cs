using BLL.Repositories;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class MediaFileController : ControllerBase
{
    private readonly MediaFileBll _mediaFileBll;

    public MediaFileController(MediaFileBll mediaFileBll)
    {
        _mediaFileBll = mediaFileBll;
    }

    // GET api/mediafile
    [HttpGet]
    public async Task<ActionResult<List<MediaFile>>> GetAllMediaFiles()
    {
        var mediaFiles = await _mediaFileBll.GetAllMediaFiles();
        return Ok(mediaFiles);
    }

    // GET api/mediafile/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<MediaFile>> GetMediaFileById(string id)
    {
        var mediaFile = await _mediaFileBll.GetMediaFileById(id);
        if (mediaFile == null)
            return NotFound();
        return Ok(mediaFile);
    }

    // POST api/mediafile
    [HttpPost]
    public async Task<ActionResult> AddMediaFile(MediaFile mediaFile)
    {
        await _mediaFileBll.AddMediaFile(mediaFile);
        return CreatedAtAction(nameof(GetMediaFileById), new { id = mediaFile.Id }, mediaFile);
    }

    // PUT api/mediafile/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateMediaFile(string id, MediaFile updatedMediaFile)
    {
        var existing = await _mediaFileBll.GetMediaFileById(id);
        if (existing == null)
            return NotFound();

        await _mediaFileBll.UpdateMediaFile(id, updatedMediaFile);
        return NoContent();
    }

    // DELETE api/mediafile/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMediaFile(string id)
    {
        var existing = await _mediaFileBll.GetMediaFileById(id);
        if (existing == null)
            return NotFound();

        await _mediaFileBll.DeleteMediaFile(id);
        return NoContent();
    }
}
