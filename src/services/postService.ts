import Post, { IPostDocument } from '../models/Post.ts';
import { Types } from 'mongoose';

interface Media {
  fileId: string;
  type: 'photo' | 'video' | 'document';
}

export const createPost = (
  content: string,
  media?: Media | null = null,
  authorId: Types.ObjectId
): Promise<IPostDocument> => {
  try {
    const post = new Post({
      content,
      media,
      author: authorId,
    });
  } catch (error) {}
};
