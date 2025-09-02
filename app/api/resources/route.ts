import { NextRequest, NextResponse } from 'next/server';
import { sequelize } from '@/lib/sequelize';
import { ResourceCategory, ResourceVideo, ResourceBook, ResourcePodcast } from '@/lib/sequelize/models';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type'); // 'video', 'book', 'podcast', or 'all'
    const difficulty = searchParams.get('difficulty');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { is_active: true };
    if (category && category !== 'all') whereClause.category_id = parseInt(category);
    if (difficulty && difficulty !== 'all') whereClause.difficulty_level = difficulty;
    if (featured === 'true') whereClause.is_featured = true;
    
    // Add search functionality
    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    let videos: any[] = [];
    let books: any[] = [];
    let podcasts: any[] = [];
    let totalCount = 0;

    // Fetch videos
    if (type === 'all' || type === 'video' || !type) {
      const videoResult = await ResourceVideo.findAndCountAll({
        where: whereClause,
        include: [{
          model: ResourceCategory,
          as: 'category',
          attributes: ['id', 'name', 'color']
        }],
        limit: type === 'video' ? limit : Math.ceil(limit / 3),
        offset: type === 'video' ? offset : 0,
        order: [['created_at', 'DESC']]
      });
      videos = videoResult.rows;
      if (type === 'video') totalCount = videoResult.count;
    }

    // Fetch books
    if (type === 'all' || type === 'book' || !type) {
      const bookResult = await ResourceBook.findAndCountAll({
        where: whereClause,
        limit: type === 'book' ? limit : Math.ceil(limit / 3),
        offset: type === 'book' ? offset : 0,
        order: [['created_at', 'DESC']]
      });
      books = bookResult.rows;
      if (type === 'book') totalCount = bookResult.count;
    }

    // Fetch podcasts
    if (type === 'all' || type === 'podcast' || !type) {
      const podcastResult = await ResourcePodcast.findAndCountAll({
        where: whereClause,
        limit: type === 'podcast' ? limit : Math.ceil(limit / 3),
        offset: type === 'podcast' ? offset : 0,
        order: [['created_at', 'DESC']]
      });
      podcasts = podcastResult.rows;
      if (type === 'podcast') totalCount = podcastResult.count;
    }

    // If fetching all types, calculate total count
    if (type === 'all' || !type) {
      const [videoCount, bookCount, podcastCount] = await Promise.all([
        ResourceVideo.count({ where: whereClause }),
        ResourceBook.count({ where: whereClause }),
        ResourcePodcast.count({ where: whereClause })
      ]);
      totalCount = videoCount + bookCount + podcastCount;
    }

    // Transform data for frontend
    const transformVideo = (video: any) => ({
      id: video.id,
      type: 'video',
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      duration_seconds: video.duration_seconds,
      source: video.source,
      difficulty_level: video.difficulty_level,
      tags: video.tags,
      views_count: video.views_count,
      rating: video.rating,
      is_featured: video.is_featured,
      category: video.category,
      created_at: video.created_at
    });

    const transformBook = (book: any) => ({
      id: book.id,
      type: 'book',
      title: book.title,
      author: book.author,
      description: book.description,
      cover_image_url: book.cover_image_url,
      file_url: book.file_url,
      file_size_mb: book.file_size_mb,
      file_type: book.file_type,
      pages: book.pages,
      isbn: book.isbn,
      publisher: book.publisher,
      publication_year: book.publication_year,
      difficulty_level: book.difficulty_level,
      tags: book.tags,
      downloads_count: book.downloads_count,
      rating: book.rating,
      is_featured: book.is_featured,
      category: book.category,
      created_at: book.created_at
    });

    const transformPodcast = (podcast: any) => ({
      id: podcast.id,
      type: 'podcast',
      title: podcast.title,
      description: podcast.description,
      host: podcast.host,
      url: podcast.url,
      platform: podcast.platform,
      cover_image_url: podcast.cover_image_url,
      duration_seconds: podcast.duration_seconds,
      episode_number: podcast.episode_number,
      season_number: podcast.season_number,
      difficulty_level: podcast.difficulty_level,
      tags: podcast.tags,
      listens_count: podcast.listens_count,
      rating: podcast.rating,
      is_featured: podcast.is_featured,
      category: podcast.category,
      created_at: podcast.created_at
    });

    const transformedVideos = videos.map(transformVideo);
    const transformedBooks = books.map(transformBook);
    const transformedPodcasts = podcasts.map(transformPodcast);

    const resources = {
      videos: transformedVideos,
      books: transformedBooks,
      podcasts: transformedPodcasts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };

    return NextResponse.json(resources);

  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}
