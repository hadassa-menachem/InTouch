namespace BLL.DTO
{
    public class StoryDTO
    {
        public string? Id { get; set; }
        public string UserId { get; set; } = "";
        public string Content { get; set; } = "";
        public List<MediaFileDTO> MediaFiles { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UserName { get; set; }
        public UserDTO? User { get; set; }
        public int DurationInHours { get; set; } = 24;
        public List<string> ViewedByUserIds { get; set; } = new List<string>();
    }
}
