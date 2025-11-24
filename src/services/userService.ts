import User, { IUserDocument } from '../models/User';
import type { User as TelegramUser } from '@telegraf/types';
import Post, { IPostDocument } from '../models/Post';

export const findOrCreateUser = async (telegramUser: TelegramUser): Promise<IUserDocument> => {
  let user = await User.findOne({ telegramId: telegramUser.id.toString() });

  if (!user) {
    user = new User({
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
    });
    await user.save();
    console.log(`✅ Новый пользователь: ${user.firstName} (${user.telegramId})`);
  }

  return user;
};

export const getUserStats = async (
  userId: string
): Promise<{ postsCount: number; likesCount: number }> => {
  const postsCount = await Post.countDocuments({ author: userId });

  const userPosts = await Post.find({ author: userId });
  const likesCount = userPosts.reduce(
    (count: number, post: IPostDocument) => count + post.likes.length,
    0
  );

  return { postsCount, likesCount };
};
