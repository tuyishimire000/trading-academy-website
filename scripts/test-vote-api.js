const fetch = require('node-fetch');

async function testVoteAPI() {
  try {
    console.log('Testing vote API...');
    
    // First, let's get a list of posts to vote on
    const postsResponse = await fetch('http://localhost:3000/api/forum/posts?includeReplies=true');
    if (!postsResponse.ok) {
      console.error('Failed to fetch posts:', postsResponse.status, postsResponse.statusText);
      return;
    }
    
    const posts = await postsResponse.json();
    console.log('Found posts:', posts.length);
    
    if (posts.length === 0) {
      console.log('No posts found to vote on');
      return;
    }
    
    const firstPost = posts[0];
    console.log('Testing vote on post:', firstPost.id, firstPost.title);
    
    // Test voting (this will fail without authentication, but we can see the error)
    const voteResponse = await fetch(`http://localhost:3000/api/forum/posts/${firstPost.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: 'up' })
    });
    
    console.log('Vote response status:', voteResponse.status);
    if (!voteResponse.ok) {
      const errorText = await voteResponse.text();
      console.log('Vote error response:', errorText);
    } else {
      const result = await voteResponse.json();
      console.log('Vote successful:', result);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVoteAPI();

