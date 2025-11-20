import { Telegraf, Markup, session, Context } from 'telegraf';
import { findOrCreateUser, getUserStats } from '../services/userService.js';
import { IUserDocument } from '../models/User.js';

interface SessionData {
  creatingPost?: boolean;
  media?: {
    fileId: string;
    type: 'photo' | 'video' | 'document';
  };
}

interface BotContext extends Context {
  session?: SessionData;
  user?: IUserDocument;
}

export const createBot = (token: string) => {
  const bot = new Telegraf<BotContext>(token);

  setupMiddlewares(bot);
  setupCommands(bot);
  setupHandlers(bot);

  return bot;
};

const setupMiddlewares = (bot: Telegraf<BotContext>) => {
  bot.use(
    session({
      defaultSession: () => ({}),
    })
  );

  bot.use(async (ctx, next) => {
    if (ctx.from) {
      try {
        ctx.user = await findOrCreateUser(ctx.from);
      } catch (error) {
        console.error('Ошибка в user middleware: ', error);
      }
    }
    await next();
  });
};

const setupCommands = (bot: Telegraf<BotContext>) => {
  bot.start(handleStart);
  bot.help(handleHelp);
  bot.command('profile', handleProfile);
  bot.command('newpost', handleNewPost);
  bot.command('cancel', handleCancel);
  bot.command('feed', handleFeed);
};

const setupHandlers = (bot: Telegraf<BotContext>) => {
  bot.on('text', handleText);
  bot.on(['photo', 'video', 'document'], handleMedia);
};

const handleStart = async (ctx: BotContext) => {
  if (!ctx.user) {
    return ctx.reply('Ошибка регистрации. Попробуйте позже.');
  }

  await ctx.reply(
    `👋 Привет, ${ctx.user.username}! 👋\n\n ` +
      'Добро пожаловать в Minder Bot - твой личный форум в Telegram! 🎉\n\n' +
      '📝 Здесь ты можешь делиться своими мыслями, идеями и общаться с другими пользователями.\n\n' +
      '<b>Доступные команды: </b>\n' +
      '/newpost - создать новый пост\n' +
      '/feed - посмотреть ленту постов\n' +
      '/profile - твой профиль\n' +
      '/help - помощь',
    {
      parse_mode: 'HTML',
      ...getMainKeyboard(),
    }
  );
};

const handleHelp = (ctx: BotContext) => {
  ctx.reply(
    '📖 <b>Помощь по Minder Bot</b>\n\n' +
      '<b>Основные команды:</b>\n' +
      '/start - начать работу\n' +
      '/newpost - создать пост (текст, фото, видео, файлы до 1MB)\n' +
      '/feed - посмотреть последние посты\n' +
      '/profile - твоя статистика\n\n' +
      '<b>Как создать пост:</b>\n' +
      '1. Отправь /newpost\n' +
      '2. Напиши текст поста\n' +
      '3. Можешь прикрепить фото, видео или документ\n' +
      '4. Пост опубликуется автоматически!\n\n' +
      '💡 <i>Лайкай посты других пользователей и оставляй комментарии!</i>',
    {
      parse_mode: 'HTML',
      ...getMainKeyboard(),
    }
  );
};

const handleProfile = async (ctx: BotContext) => {
  if (!ctx.user) {
    return ctx.reply('❌ Пользователь не найден.');
  }

  try {
    const stats = await getUserStats(ctx.user._id.toString());

    await ctx.reply(
      `👤 <b>Твой профиль</b>\n\n` +
        `📝 Постов: <b>${stats.postsCount}</b>\n` +
        `❤️ Лайков: <b>${stats.likesCount}</b>\n` +
        `📅 Регистрация: <b>${ctx.user.createdAt.toLocaleDateString('ru-RU')}</b>\n\n` +
        `💪 Продолжайте делиться своими мыслями!`,
      {
        parse_mode: 'HTML',
        ...getMainKeyboard(),
      }
    );
  } catch (error) {
    console.error('Ошибка в команде profile:', error);
    ctx.reply('❌ Ошибка при загрузке профиля.');
  }
};

const handleNewPost = (ctx: BotContext) => {
  ctx.session = {
    ...ctx.session,
    creatingPost: true,
  };

  ctx.reply(
    '📝 <b>Создание нового поста</b>\n\n' +
      'Напиши текст твоего поста. Ты также можешь прикрепить:\n' +
      '📷 Фото\n' +
      '🎥 Видео (до 1MB)\n' +
      '📄 Документ (до 1MB)\n\n' +
      '❌ <i>Для отмены используй /cancel</i>',
    {
      parse_mode: 'HTML',
      ...Markup.removeKeyboard(),
    }
  );
};

const handleFeed = async (ctx: BotContext) => {
  try {
    await ctx.reply('📰 <b>Загружаем ленту...</b>', { parse_mode: 'HTML' });

    ctx.reply(
      '🔄 <b>Лента постов скоро будет доступна!</b>\n\n' +
        'Сначала создай несколько постов командой /newpost',
      {
        parse_mode: 'HTML',
        ...getMainKeyboard(),
      }
    );
  } catch (error) {
    console.error('Ошибка в команде feed:', error);
    ctx.reply('❌ Ошибка при загрузке ленты.');
  }
};

const handleCancel = (ctx: BotContext) => {
  ctx.session = {};

  ctx.reply('❌ Действие отменено.', getMainKeyboard());
};

const handleText = async (ctx: BotContext) => {
  if (ctx.session?.creatingPost) {
    try {
      await ctx.reply(
        '✅ <b>Пост успешно создан!</b>\n\n' +
          'Спасибо за вашу мысль! 🎉\n\n' +
          'Функционал лайков и комментариев будет добавлен в ближайшее время.',
        {
          parse_mode: 'HTML',
          ...getMainKeyboard(),
        }
      );
      ctx.session = {};
    } catch (error) {
      console.error('Ошибка при создании поста:', error);
      ctx.reply('❌ Ошибка при создании поста.');
    }
  }
};

const handleMedia = async (ctx: BotContext) => {
  if (ctx.session?.creatingPost) {
    await ctx.reply('📎 <b>Медиа-файл принят!</b>\n\n' + 'Теперь отправь текст для поста.', {
      parse_mode: 'HTML',
    });
  }
};

const getMainKeyboard = () => {
  return Markup.keyboard([
    ['📝 Новый пост', '📰 Лента'],
    ['👤 Профиль', 'ℹ️ Помощь'],
  ]).resize();
};

export const launchBot = (bot: Telegraf) => {
  bot.launch();
  console.log('✅ Бот запущен!');
};
