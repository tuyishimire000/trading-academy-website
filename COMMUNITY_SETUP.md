# Community Forum Setup Guide

This guide explains how to set up and use the fully functional Reddit-like community forum for the Prime Aura Trading Academy.

## 🚀 Features

The community forum includes:

- **Post Creation**: Users can create posts with titles and content
- **Categories**: Organized discussion topics (General, Strategy, Analysis, News, Help)
- **Voting System**: Upvote/downvote posts and comments
- **Comments & Replies**: Nested comment system
- **Search & Filtering**: Find posts by content, author, or category
- **Sorting Options**: Newest, Most Popular, Trending
- **User Roles**: Member, Moderator, Admin with different permissions
- **Real-time Updates**: Instant feedback on actions

## 🗄️ Database Setup

### 1. Create User Votes Table

Run the SQL script to create the voting system:

```bash
# Option 1: Run the SQL directly
mysql -u your_username -p your_database < scripts/create-user-votes-table.sql

# Option 2: Use the test script
node scripts/test-community.js
```

### 2. Verify Database Structure

The following tables should exist:

- `forum_categories` - Forum categories and topics
- `forum_posts` - Posts and comments
- `user_votes` - User voting records
- `users` - User accounts

## 🔧 API Endpoints

### Forum Posts
- `GET /api/forum/posts` - Fetch posts with optional filtering
- `POST /api/forum/posts` - Create new post or comment
- `POST /api/forum/posts/[id]/vote` - Vote on a post

### Forum Categories
- `GET /api/forum/categories` - Fetch all active categories

## 📱 Usage

### Accessing the Community

1. **Dashboard Integration**: Community is accessible from the main dashboard
2. **Dedicated Page**: Full community experience at `/community`
3. **Mobile Responsive**: Works on all device sizes

### Creating Posts

1. Click "What's on your mind?" in the create post section
2. Add an optional title
3. Write your post content
4. Select a category
5. Click "Post"

### Voting

- **Upvote**: Click the up arrow (green when active)
- **Downvote**: Click the down arrow (red when active)
- **Remove Vote**: Click the same arrow again
- **Change Vote**: Click the opposite arrow

### Commenting

1. Click "Comments" on any post
2. Write your comment in the text area
3. Click "Comment" to post

### Searching & Filtering

- **Search**: Use the search bar to find posts by content or author
- **Categories**: Filter by specific topics using the sidebar
- **Sorting**: Choose between Newest, Most Popular, or Trending

## 🎨 Customization

### Adding New Categories

1. Add to the database:
```sql
INSERT INTO forum_categories (name, description, slug, sort_order) 
VALUES ('New Category', 'Description', 'new-category', 10);
```

2. The category will automatically appear in the sidebar

### Modifying Post Types

Edit `components/community/community-page.tsx` to:
- Add new post fields
- Modify the voting system
- Change the UI layout

### Styling

The community uses Tailwind CSS. Modify classes in:
- `components/community/community-page.tsx`
- `components/community/community-header.tsx`

## 🧪 Testing

### Run the Test Script

```bash
node scripts/test-community.js
```

This will verify:
- Database connectivity
- Table structure
- Basic CRUD operations
- Voting functionality

### Manual Testing

1. **Create a Post**: Test post creation with different content
2. **Vote System**: Test upvoting, downvoting, and vote changes
3. **Comments**: Test comment creation and nesting
4. **Search**: Test search functionality with various queries
5. **Categories**: Test filtering by different categories

## 🔒 Security Features

- **Authentication Required**: Users must be logged in to post/vote
- **Input Validation**: All user inputs are validated
- **SQL Injection Protection**: Uses parameterized queries
- **Rate Limiting**: Built-in protection against spam

## 🚨 Troubleshooting

### Common Issues

1. **Posts Not Loading**
   - Check database connectivity
   - Verify forum_categories table exists
   - Check API endpoint logs

2. **Voting Not Working**
   - Ensure user_votes table exists
   - Check user authentication
   - Verify API endpoint permissions

3. **Comments Not Showing**
   - Check includeReplies parameter in API call
   - Verify database relationships
   - Check for JavaScript errors in console

### Debug Mode

Enable debug logging by checking the browser console and server logs for:
- API request/response data
- Database query results
- Authentication status

## 📈 Performance Optimization

### Database Indexes

The setup includes indexes on:
- `user_votes.user_id`
- `user_votes.post_id`
- `forum_posts.category_id`
- `forum_posts.created_at`

### Caching

Consider implementing:
- Redis for session storage
- CDN for static assets
- Database query caching

## 🔄 Future Enhancements

Potential improvements:
- **Real-time Updates**: WebSocket integration for live updates
- **Moderation Tools**: Admin panel for content moderation
- **Rich Text Editor**: Markdown support for posts
- **File Attachments**: Image and document uploads
- **User Reputation**: Gamification system
- **Mobile App**: Native mobile application

## 📞 Support

For technical support:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify database schema matches expected structure
4. Test with the provided test script

---

**Note**: This community system is designed to be production-ready and scalable. It follows best practices for security, performance, and user experience.

