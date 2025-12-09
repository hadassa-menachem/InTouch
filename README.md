📱 InTouch – Modern Full-Stack Social Network
InTouch is a full-featured social network project that allows users to connect through posts, stories, messages, likes, comments, and more — similar to leading social media apps.
The system is built with Angular on the frontend, ASP.NET Core on the backend, and uses MongoDB as the database.

The project includes animations, enhanced user experience, and smooth navigation between all app pages.

Status: Ready for launch but not publicly deployed.

🚀 Main Features by Page

🏠 Home Page
Description: Displays posts from users alongside random story circles representing different users. Users can navigate to any user’s profile.

Capabilities:

Like posts

Add comments (including emojis)

Save posts

Navigate to users’ profiles
![App Screenshot](https://github.com/user-attachments/assets/86cee2bb-94df-424e-a904-33423988042d)

👤 Other User Profile
Description: View another user's activities, including posts, stories, and social connections.

Capabilities:

Direct chat with the user

Follow / unfollow the user

View user posts (images / video tabs)

View user stories

View user followers and following (with profile picture, name, description)


💬 Direct Chat (DM)
Description: Private real-time conversations between two users.

Capabilities:

Send text messages, files, and emojis

Real-time message status: sent / delivered / read

Display messages with exact timestamp

Auto-scroll to latest message


👤 My Profile
Description: Manage personal activities and user information.

Capabilities:

Upload stories

View own stories + number of views

Edit profile

View followers and following (profile picture, name, description)

Delete posts

View own posts (images / video)


📝 Post Page
Description: View a full post and interact with it.

Capabilities:

View full post

Like, comment (including emojis), and save post


🔍 Search Page
Description: Search for users and navigate to their profiles.

Capabilities:

Search users by name

Display users (profile picture, name, description)

Navigate to user profile


✉️ Inbox
Description: View all personal chats with other users.

Capabilities:

List sorted from latest to oldest according to chat time

Mark unread messages with a bubble on the sender’s profile picture

Preview last message with status: sent / delivered / read (if sent by me)

Search chat by username → direct navigation to chat


💾 Saved Posts
Description: View all posts saved by the user.

Capabilities:

View saved posts

Hover to see post text, number of comments, and likes


⬆️ Create Post
Description: Upload new posts with preview before posting.

Capabilities:

Upload posts with text and image/video

Preview post before uploading


📸 Create Story
Description: Upload new stories with text and display duration.

Capabilities:

Upload new stories

Select how long the story is displayed

Preview story before uploading, including text


🗄️ Database Structure – MongoDB
Description: Flexible, well-connected collections between entities.

Collections:

Users, Posts, Stories, Messages, Comments, Likes, Followers, SavedPosts

Smart connections between entities allow efficient retrieval of related data automatically.

🛠️ Technologies
Frontend:

Angular, TypeScript, RxJS, Routing

Bootstrap, Angular Material

HTML + CSS

Animations and enhanced user experience

Backend:

ASP.NET Core Web API, C#

AutoMapper

MongoDB Driver

Layered architecture: DAL / BLL / DTO / Interfaces / Mapper

General:

REST API

Clean and precise design

High-level user experience

👩‍💻 Developed by: Hadassa Menache
