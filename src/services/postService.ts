import { db } from '../database/database';

export interface TPost {}

// interface Media {
//   fileId: string;
//   type: 'photo' | 'video' | 'document';
// }

export const createPost = async (
  content: string,
  media: Media | null = null,
  authorId: Types.ObjectId
): Promise<IPostDocument> => {
  const post = new Post({
    content,
    media,
    author: authorId,
  });

  await post.save();
  await post.populate('author', 'firstName username');

  console.log(`✅ Новый пост от ${post.author}`);
  return post;
};

export const getFeed = async (
  page: number = 0,
  limit: number = 5
): Promise<{
  posts: IPostDocument[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}> => {
  const posts = await Post.find()
    .populate('author', 'firstName username')
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);

  const total = await Post.countDocuments();

  return {
    posts,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalPosts: total,
  };
};

export const toggleLike = async (postId: string, userId: Types.ObjectId) => {
  return { likes: 0, hasLiked: false };
};

export const addView = (postId: string, userId: Types.ObjectId) => {
  return 0;
};

export const addComment = (postId: string, userId: Types.ObjectId, content: string) => {
  return 0;
};
