# Forum Features Implementation

## Overview
The community forum now includes unique anonymous usernames and an improved aura points system that rewards quality content creation.

## Key Features

### 1. Unique Anonymous Usernames
- Each user gets a unique anonymous username in the format `u/xxxxxx` (e.g., `u/abc123`)
- Usernames are generated automatically and stored in the database
- Ensures privacy while maintaining consistent identity within the forum
- One username per user account, persistent across sessions

### 2. Improved Aura Points System
- **Earning Aura**: Users only earn aura points when OTHER users upvote their posts or comments
- **Losing Aura**: Users lose aura points when OTHER users downvote their content
- **No Self-Voting**: Users cannot vote on their own posts/comments
- **Vote Values**:
  - Upvote on your content: +1 aura
  - Downvote on your content: -1 aura
  - Changing vote: Adjusts by 2 points (e.g., upvote to downvote = -2 aura)
- **Minimum Aura**: Aura points cannot go below 0

### 3. Enhanced Vote UI
- **Prominent Buttons**: Larger, more visible upvote/downvote buttons
- **Visual Feedback**: Clear hover states and voted states
- **Color Coding**: 
  - Upvote: Orange (#ff4500) when hovered/voted
  - Downvote: Blue (#7193ff) when hovered/voted
- **Score Display**: Shows net score (upvotes - downvotes)

### 4. Negative Vote Handling
- Posts/comments can have negative scores
- If a post has 0 upvotes and gets 1 downvote, score becomes -1
- Continues counting negatively: -2, -3, -4, etc.

## Database Schema

### forum_users
- `id`: Primary key
- `user_id`: Reference to main users table
- `anonymous_username`: Unique username (e.g., u/abc123)
- `aura_points`: Current aura points (minimum 0)
- `created_at`: Timestamp

### forum_posts
- `id`: Primary key
- `title`: Post title
- `content`: Post content
- `community`: Community name (depression, anxiety, stress)
- `author_username`: Anonymous username of author
- `upvotes`: Number of upvotes
- `downvotes`: Number of downvotes
- `created_at`: Timestamp

### forum_comments
- `id`: Primary key
- `post_id`: Reference to post
- `content`: Comment content
- `author_username`: Anonymous username of author
- `upvotes`: Number of upvotes
- `downvotes`: Number of downvotes
- `created_at`: Timestamp

### forum_votes
- `id`: Primary key
- `voter_username`: Username of voter
- `target_type`: 'post' or 'comment'
- `target_id`: ID of post or comment
- `vote_type`: 'upvote' or 'downvote'
- `created_at`: Timestamp
- **Unique constraint**: (voter_username, target_type, target_id)

## API Endpoints

### GET /api/forum/user?userId={id}
- Gets or creates anonymous username for user
- Returns username and current aura points

### POST /api/forum/posts
- Creates new post
- Body: `{ title, content, community, authorUsername }`

### GET /api/forum/posts?community={name}&postId={id}
- Gets posts for community or specific post

### POST /api/forum/comments
- Creates new comment
- Body: `{ postId, content, authorUsername }`

### GET /api/forum/comments?postId={id}
- Gets comments for a post

### POST /api/forum/vote
- Handles voting on posts/comments
- Body: `{ postId?, commentId?, voteType, voterUsername }`
- Prevents self-voting
- Updates aura points for content authors

## Usage Instructions

1. **Access Forum**: Users must be logged in to access the community forum
2. **Automatic Username**: Anonymous username is generated on first forum access
3. **Create Content**: Users can create posts and comments
4. **Vote on Content**: Users can upvote/downvote others' content (not their own)
5. **Earn Aura**: Aura points are earned when others upvote your content
6. **Track Progress**: Aura points are displayed next to username

## Testing

Use the `test-forum.html` file to test API endpoints:
1. Initialize database tables
2. Create forum user
3. Create test posts
4. Test voting functionality
5. Verify aura point calculations

## Security Features

- **Anonymous Identity**: Real names/emails are never exposed in forum
- **Vote Integrity**: Prevents self-voting and duplicate voting
- **Data Isolation**: Forum data is separate from medical data
- **Input Validation**: All inputs are validated and sanitized