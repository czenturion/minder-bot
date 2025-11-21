import User, { IUserDocument } from '../models/User.js';
import type { User as TelegramUser } from '@telegraf/types';
import Post from '../models/Post.js';

export const findOrCreateUser = async (telegramUser: TelegramUser): Promise<IUserDocument> => {};
