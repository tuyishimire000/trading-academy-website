const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupResources() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'trading_academy',
      charset: 'utf8mb4'
    });

    console.log('Connected to database successfully');

    // Read and execute the SQL schema
    const fs = require('fs');
    const schemaSQL = fs.readFileSync('./scripts/create-resources-schema.sql', 'utf8');
    
    // Split SQL by semicolons and execute each statement
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
            console.error('Error executing statement:', error.message);
          }
        }
      }
    }

    console.log('Database schema created successfully');

    // Seed sample data
    await seedSampleData(connection);
    
    console.log('Resources setup completed successfully!');

  } catch (error) {
    console.error('Error setting up resources:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function seedSampleData(connection) {
  console.log('Seeding sample data...');

  // Sample videos
  const sampleVideos = [
    {
      title: 'Introduction to Technical Analysis',
      description: 'Learn the basics of technical analysis including chart patterns, support/resistance, and trend analysis.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration_seconds: 1800,
      source: 'youtube',
      source_id: 'dQw4w9WgXcQ',
      category_id: 2,
      difficulty_level: 'beginner',
      tags: JSON.stringify(['technical analysis', 'charts', 'patterns']),
      views_count: 15420,
      rating: 4.8,
      is_featured: true
    },
    {
      title: 'Risk Management Strategies for Traders',
      description: 'Essential risk management techniques including position sizing, stop losses, and portfolio management.',
      url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      thumbnail_url: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      duration_seconds: 2400,
      source: 'youtube',
      source_id: '9bZkp7q19f0',
      category_id: 4,
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['risk management', 'position sizing', 'stop loss']),
      views_count: 8920,
      rating: 4.9,
      is_featured: true
    },
    {
      title: 'Cryptocurrency Trading Fundamentals',
      description: 'Understanding blockchain, crypto markets, and trading strategies for digital assets.',
      url: 'https://www.youtube.com/watch?v=1M4dt2B3KkY',
      thumbnail_url: 'https://img.youtube.com/vi/1M4dt2B3KkY/maxresdefault.jpg',
      duration_seconds: 3600,
      source: 'youtube',
      source_id: '1M4dt2B3KkY',
      category_id: 6,
      difficulty_level: 'beginner',
      tags: JSON.stringify(['cryptocurrency', 'bitcoin', 'blockchain']),
      views_count: 23450,
      rating: 4.7,
      is_featured: false
    }
  ];

  // Sample books
  const sampleBooks = [
    {
      title: 'Technical Analysis of the Financial Markets',
      author: 'John J. Murphy',
      description: 'A comprehensive guide to technical analysis covering all major chart patterns, indicators, and trading strategies.',
      cover_image_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388200543i/125516.jpg',
      file_url: 'https://example.com/books/technical-analysis-murphy.pdf',
      file_size_mb: 25.6,
      file_type: 'pdf',
      pages: 576,
      isbn: '978-0735200661',
      publisher: 'New York Institute of Finance',
      publication_year: 1999,
      category_id: 2,
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['technical analysis', 'chart patterns', 'indicators']),
      downloads_count: 1250,
      rating: 4.9,
      is_featured: true
    },
    {
      title: 'Trading Psychology: The Art of Discipline',
      author: 'Mark Douglas',
      description: 'Master the psychological aspects of trading including mindset, discipline, and emotional control.',
      cover_image_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388200543i/125516.jpg',
      file_url: 'https://example.com/books/trading-psychology-douglas.pdf',
      file_size_mb: 18.3,
      file_type: 'pdf',
      pages: 320,
      isbn: '978-0735200662',
      publisher: 'Prentice Hall',
      publication_year: 2000,
      category_id: 5,
      difficulty_level: 'beginner',
      tags: JSON.stringify(['psychology', 'mindset', 'discipline']),
      downloads_count: 890,
      rating: 4.8,
      is_featured: false
    },
    {
      title: 'Options Trading Strategies',
      author: 'Lawrence G. McMillan',
      description: 'Advanced options trading strategies including spreads, straddles, and complex option combinations.',
      cover_image_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388200543i/125516.jpg',
      file_url: 'https://example.com/books/options-strategies-mcmillan.pdf',
      file_size_mb: 32.1,
      file_type: 'pdf',
      pages: 720,
      isbn: '978-0735200663',
      publisher: 'Wiley',
      publication_year: 2002,
      category_id: 9,
      difficulty_level: 'advanced',
      tags: JSON.stringify(['options', 'strategies', 'spreads']),
      downloads_count: 567,
      rating: 4.6,
      is_featured: false
    }
  ];

  // Sample podcasts
  const samplePodcasts = [
    {
      title: 'The Trading Psychology Podcast',
      description: 'Weekly insights on trading psychology, mindset, and emotional control for successful trading.',
      host: 'Dr. Brett Steenbarger',
      url: 'https://open.spotify.com/show/1234567890',
      platform: 'spotify',
      platform_id: '1234567890',
      cover_image_url: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526',
      duration_seconds: 2700,
      episode_number: 45,
      season_number: 2,
      category_id: 5,
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['psychology', 'mindset', 'weekly']),
      listens_count: 12500,
      rating: 4.8,
      is_featured: true
    },
    {
      title: 'Technical Analysis Daily',
      description: 'Daily technical analysis of major markets including stocks, forex, and commodities.',
      host: 'Steve Nison',
      url: 'https://www.youtube.com/playlist?list=PL1234567890',
      platform: 'youtube',
      platform_id: 'PL1234567890',
      cover_image_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration_seconds: 900,
      episode_number: 156,
      season_number: 3,
      category_id: 2,
      difficulty_level: 'beginner',
      tags: JSON.stringify(['technical analysis', 'daily', 'markets']),
      listens_count: 8900,
      rating: 4.7,
      is_featured: false
    },
    {
      title: 'Crypto Trading Insights',
      description: 'Expert analysis of cryptocurrency markets, trends, and trading opportunities.',
      host: 'Andreas Antonopoulos',
      url: 'https://podcasts.apple.com/us/podcast/1234567890',
      platform: 'apple',
      platform_id: '1234567890',
      cover_image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts123/v4/12/34/56/1234567890/mza_1234567890.jpg',
      duration_seconds: 3600,
      episode_number: 23,
      season_number: 1,
      category_id: 6,
      difficulty_level: 'intermediate',
      tags: JSON.stringify(['cryptocurrency', 'bitcoin', 'trading']),
      listens_count: 15600,
      rating: 4.9,
      is_featured: true
    }
  ];

  // Insert sample videos
  for (const video of sampleVideos) {
    await connection.execute(
      'INSERT INTO resource_videos (title, description, url, thumbnail_url, duration_seconds, source, source_id, category_id, difficulty_level, tags, views_count, rating, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [video.title, video.description, video.url, video.thumbnail_url, video.duration_seconds, video.source, video.source_id, video.category_id, video.difficulty_level, video.tags, video.views_count, video.rating, video.is_featured]
    );
  }

  // Insert sample books
  for (const book of sampleBooks) {
    await connection.execute(
      'INSERT INTO resource_books (title, author, description, cover_image_url, file_url, file_size_mb, file_type, pages, isbn, publisher, publication_year, category_id, difficulty_level, tags, downloads_count, rating, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [book.title, book.author, book.description, book.cover_image_url, book.file_url, book.file_size_mb, book.file_type, book.pages, book.isbn, book.publisher, book.publication_year, book.category_id, book.difficulty_level, book.tags, book.downloads_count, book.rating, book.is_featured]
    );
  }

  // Insert sample podcasts
  for (const podcast of samplePodcasts) {
    await connection.execute(
      'INSERT INTO resource_podcasts (title, description, host, url, platform, platform_id, cover_image_url, duration_seconds, episode_number, season_number, category_id, difficulty_level, tags, listens_count, rating, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [podcast.title, podcast.description, podcast.host, podcast.url, podcast.platform, podcast.platform_id, podcast.cover_image_url, podcast.duration_seconds, podcast.episode_number, podcast.season_number, podcast.category_id, podcast.difficulty_level, podcast.tags, podcast.listens_count, podcast.rating, podcast.is_featured]
    );
  }

  console.log('Sample data seeded successfully');
}

// Run the setup
setupResources().catch(console.error);



