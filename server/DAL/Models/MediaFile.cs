public class MediaFile
{
    public string Id { get; set; }
    public string Url { get; set; }
    public string MediaType { get; set; }
    public DateTime UploadedAt { get; set; }
    public string? PostId { get; set; }
}
