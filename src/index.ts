import { createBot, launchBot } from './bot/bot.ts';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    console.log('🚀 Запускаем Minder Bot...');

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env file');
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    // Подключение к MongoDB
    console.log('📦 Подключаемся к MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB подключена успешно');

    // Запуск бота
    console.log('🤖 Initializing Telegram bot...');
    const bot = createBot(process.env.TELEGRAM_BOT_TOKEN);
    launchBot(bot);

    console.log('🎉 Minder Bot is now running!');
    console.log('👉 Send /start to your bot in Telegram');
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
};

process.once('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  process.exit();
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Stopping bot...');
  process.exit();
});

main();
