📱**InTouch – Modern Full-Stack Social Network**

InTouch is a full-featured social network project that allows users to connect through posts, stories, messages, likes, comments, and more — similar to leading social media apps.

The system is built with Angular on the frontend, ASP.NET Core on the backend, and uses MongoDB as the database.

The project includes animations, enhanced user experience, smooth navigation between all app pages, and real-time features powered by SignalR (WebSockets).


🏠**Home Page**

Description: Displays posts from users alongside random story circles representing different users. Users can navigate to any user’s profile.

Capabilities:

Like post

Add comment (including emojis)

Save post

View post summary – automatically generated using AI

Navigate to users’ profiles

<img src="https://github.com/user-attachments/assets/345b6a0b-9168-430d-a99c-4ee9c156b01f" width="320">


👤**Other User Profile**

Description: View another user's activities, including posts, stories, and social connections.

Capabilities:

Direct chat with the user (real-time via WebSockets)

See if the user is online/offline in real-time

Follow / unfollow the user

View user posts (images / video tabs)

View user stories

View user followers and following (profile picture, name, description)

<img src="https://github.com/user-attachments/assets/de324b1d-5e91-4b70-920e-73bc711f9a5e" width="320" />


💬**Direct Chat (DM)**

Description: Private real-time conversations between two users.

Capabilities:

Send text messages, files, and emojis

Real-time message delivery status: sent / delivered / read

Display messages with exact timestamp

Auto-scroll to latest message

Unread messages indicator

Online status of the chat partner

Real-time updates powered by SignalR / WebSockets

<img src="https://github.com/user-attachments/assets/99853e45-0dde-4446-b275-4494a19df955" width="320" />


👤**Personal Profile**

Description: Manage personal activities and user information.

Capabilities:

Upload stories

View own stories + number of views

Edit profile

View followers and following (profile picture, name, description)

Delete posts

View own posts (images / video)

<img src="https://github.com/user-attachments/assets/25f2a870-d1a3-4766-8629-0d42706d384d" width="320" />


📝**Post Page**
Description: View a full post and interact with it.

Capabilities:

View full post

Like, comment (including emojis), save post, view post summary

<img src="https://github.com/user-attachments/assets/5ed9afa7-2306-442c-b4cf-223c9df203ab" width="320" />


✉️**Inbox**
Description: View all personal chats with other users.

Capabilities:

List sorted from latest to oldest according to chat time

Mark unread messages with a bubble on the sender’s profile picture

Preview last message with status: sent / delivered / read (if sent by me)

Search chat by username → direct navigation to chat

Real-time updates of unread messages and online status

<img src="https://github.com/user-attachments/assets/3d4070a0-3cad-4c63-8cb9-dfaded1ea813" width="320" />


💾**Saved Posts**
Description: View all posts saved by the user.

Capabilities:

View saved posts

Hover to see post text, number of comments, and likes

<img src="https://github.com/user-attachments/assets/8675adce-cc89-44b9-8e84-e4eb2b57598f" width="320" />

⬆️**Create Post**

Description: Upload new posts with preview before posting.

Capabilities:

Upload posts with text and image/video

Preview post before uploading

<img src="https://github.com/user-attachments/assets/c83ab7d4-88f4-40e3-8edc-d2adc2f2166a" width="320" />

📸**Create Story**
Description: Upload new stories with text and display duration.

Capabilities:

Upload new stories

Select how long the story is displayed

Preview story before uploading, including text

<img src="https://github.com/user-attachments/assets/8dbdd90e-3c7f-4782-80db-42ed217b0910" width="320" />


🔍**Search Page**

Description: Search for users and navigate to their profiles.

Capabilities:

Search users by name

Display users (profile picture, name, description)

Navigate to user profile

<img src="https://github.com/user-attachments/assets/c33236f2-9d75-4138-961f-b202628a1be2" width="320" />


🗄️**Database Structure – MongoDB**

Description: Flexible, well-connected collections between entities.

Collections:

Users, Posts, Stories, Messages, Comments, Likes, Followers, SavedPosts

Features:

Smart connections between entities allow efficient retrieval of related data automatically

Messages include read/unread status

Users have online/offline status updated in real-time

🛠️ Technologies

Frontend:

Angular, TypeScript, RxJS, Routing

Bootstrap, Angular Material

HTML + CSS

Animations and enhanced user experience

Real-time updates using SignalR / WebSockets

Backend:

ASP.NET Core Web API, C#

AutoMapper

MongoDB Driver

Layered architecture: DAL / BLL / DTO / Interfaces / Mapper

General:

REST API

Clean and precise design

High-level user experience

👩‍💻 Developed by: Hadassa Menachem
