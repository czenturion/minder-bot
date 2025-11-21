import mongoose, { Document, Schema, Types } from 'mongoose';
import { IPost } from '../types/telegraf.js';

export interface IPostDocument
  extends Omit<IPost, 'author' | 'likes' | 'views' | 'comments'>,
    Document {
  author: Types.ObjectId;
  likes: Types.ObjectId[];
  views: Types.ObjectId[];
  comments: Array<{
    author: Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
}

const postSchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  media: {
    fileId: String,
    type: String,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  views: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  comments: [
    {
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IPostDocument>('Post', postSchema);
