using AutoMapper;
using BLL.DTO;
using DAL.Models;

namespace BLL.Mappings
{
    public class AutoMappingProfile : Profile
    {
        public AutoMappingProfile()
        {
            CreateMap<User, UserDTO>()
            .ForMember(dest => dest.FollowersCount, opt => opt.MapFrom(src => src.FollowersList != null ? src.FollowersList.Count : 0))
            .ForMember(dest => dest.FollowingCount, opt => opt.MapFrom(src => src.FollowingsList != null ? src.FollowingsList.Count : 0))
            .ForMember(dest => dest.PostsCount, opt => opt.MapFrom(src => src.MediaFiles != null ? src.MediaFiles.Count : 0))
            .ReverseMap();

            CreateMap<UpdateUserDTO, User>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) 
                .ForMember(dest => dest.ProfilePicUrl, opt => opt.MapFrom(src => src.profilePicUrl));
           

            CreateMap<MediaFile, MediaFileDTO>().ReverseMap();

            CreateMap<Comment, CommentDTO>()
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Text))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : ""))
                .ReverseMap()
                .ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.User, opt => opt.Ignore());

            CreateMap<Like, LikeDTO>().ReverseMap()
                .ForMember(dest => dest.FullName, opt => opt.Ignore()); 

            CreateMap<Post, PostDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : "")) 
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ReverseMap()
                .ForMember(dest => dest.User, opt => opt.Ignore()); 

            CreateMap<Message, MessageDTO>()
                .ForMember(dest => dest.SentAt, opt => opt.MapFrom(src => src.SentAt != null ? src.SentAt : DateTime.MinValue))
                .ReverseMap();

            CreateMap<Follow, FollowDTO>().ReverseMap();


            CreateMap<Story, StoryDTO>().ReverseMap();

            CreateMap<SavedPost, SavedPostDTO>().ReverseMap();
        }
    }
}