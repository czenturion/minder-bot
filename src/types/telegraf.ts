import { Context as TelegrafContext } from 'telegraf';
import { Document, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
}

export interface IPost {
  _id: Types.ObjectId;
  content: string;
  author: IUser | Types.ObjectId;
  media?: {
    fileId: string;
    type: 'photo' | 'video' | 'document';
  };
}

export interface IPost {
  _id: Types.ObjectId;
  content: string;
  author: IUser | Types.ObjectId;
  media?: {
    fileId: string;
    type: 'photo' | 'video' | 'document';
  };
  likes: (IUser | Types.ObjectId)[];
  views: (IUser | Types.ObjectId)[];
  comments: Array<{
    author: IUser | Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
  createdAt: Date;
}

declare module 'telegraf' {
  interface Context {
    user?: IUser & Document;
    post?: IPost & Document;
    session?: {
      creatingPost?: boolean;
      media?: {
        fileId: string;
        type: 'photo' | 'video' | 'document';
      };
      commentingPostId?: string;
    };
  }
}
