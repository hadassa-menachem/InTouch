using AutoMapper;
using BLL.DTO;
using DAL.Models;
using DAL.Repositories;

namespace BLL.Mappings
{
    public class AutoMappingProfile : Profile
    {
        public AutoMappingProfile()
        {
            // User
            CreateMap<User, UserDTO>().ReverseMap();
            CreateMap<User, UserDTO>()
                .ForMember(dest => dest.FollowersCount, opt => opt.MapFrom(src => src.FollowersList != null ? src.FollowersList.Count : 0))
                .ForMember(dest => dest.FollowingCount, opt => opt.MapFrom(src => src.FollowingsList != null ? src.FollowingsList.Count : 0))
                .ForMember(dest => dest.PostsCount, opt => opt.MapFrom(src => src.MediaFiles != null ? src.MediaFiles.Count : 0))
                .ReverseMap();

            // MediaFile
            CreateMap<MediaFile, MediaFileDTO>().ReverseMap();

            // Comment
            CreateMap<Comment, CommentDTO>()
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Text))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : ""))
                .ReverseMap()
                .ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.Content));

            // Like
            CreateMap<Like, LikeDTO>()
                .ForMember(dest => dest.FullName,
                    opt => opt.MapFrom(src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : ""));

            // Post
            CreateMap<Post, PostDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : ""))
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User));

            // Message
            CreateMap<Message, MessageDTO>()
                .ForMember(dest => dest.SentAt, opt => opt.MapFrom(src => src.SentAt != null ? src.SentAt : DateTime.MinValue))
                .ReverseMap();

            // Follow 
            CreateMap<Follow, FollowDTO>().ReverseMap();
            CreateMap<Follow, FollowRequestDTO>().ReverseMap();

            // Status
            CreateMap<Status, CreateStatusDTO>().ReverseMap();
            CreateMap<CreateStatusDTO, Status>().ReverseMap();
            // Story
            CreateMap<Story, CreateStoryDTO>().ReverseMap();
            CreateMap<CreateStoryDTO, Story>().ReverseMap();
        }

    }
}
