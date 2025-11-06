using BLL.DTO;
using BLL.Repositories;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using BLL.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class MediaFileController : ControllerBase
{
    private readonly IMediaFileBll _mediaFileBll;
    private readonly IMapper _mapper;

    public MediaFileController(IMediaFileBll mediaFileBll, IMapper mapper)
    {
        _mediaFileBll = mediaFileBll;
        _mapper = mapper;
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
        var dto = _mapper.Map<CreateMediaFileDTO>(mediaFile);
        await _mediaFileBll.AddMediaFile(dto);

        return CreatedAtAction(nameof(GetMediaFileById), new { id = mediaFile.Id }, mediaFile);
    }

    // PUT api/mediafile/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateMediaFile(string id, MediaFile updatedMediaFile)
    {
        var existing = await _mediaFileBll.GetMediaFileById(id);
        if (existing == null)
            return NotFound();

        var dto = _mapper.Map<MediaFileDTO>(updatedMediaFile);
        await _mediaFileBll.UpdateMediaFile(id, dto);

        return NoContent();
    }

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
