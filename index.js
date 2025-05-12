require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const TelegramBot = require('node-telegram-bot-api');

// Twitter API Configuration
const twitterClient = new TwitterApi({
  appKey: 'c1vhMTmK8GuLcOFJ79aduK5et',
  appSecret: 'hes96oAF3ABxrbRUf9awcJ8gSCMXqtXTDPuaBnS102oIQbEvAH',
  accessToken: '1785931378107748353-iRS5DDsXrGzchDhl90JtqQNuKtcXDg',
  accessSecret: '0T93ThzVcvMJ3IRddeBk0mtgtOHXnJCcIkNfWh4l9JrAs',
});

// Telegram Bot Configuration
const bot = new TelegramBot('7704093377:AAFpAgbQ6_dbHQm_WZcDxd8EAFJx78-y-Fg');
const telegramChannel = '@Cryptoland007';

// Listen for new tweets
async function streamTweets() {
  try {
    const stream = await twitterClient.v1.stream('user');
    console.log('✅ Bot started. Listening for tweets...');

    stream.on('data', async (tweet) => {
      // Skip replies/retweets
      if (tweet.inReplyToUserId || tweet.retweetedStatus) {
        console.log('⏩ Skipped reply/retweet');
        return;
      }

      // Build message
      const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
      let message = `🐦 **New Tweet!**\n━━━━━━━━━━\n${tweet.text}\n\n🔗 [View on Twitter](${tweetUrl})`;

      // Attach media (image/GIF/video) if available
      if (tweet.extended_entities?.media) {
        const mediaUrl = tweet.extended_entities.media[0].media_url_https;
        await bot.sendPhoto(telegramChannel, mediaUrl, { 
          caption: message,
          parse_mode: 'Markdown'
        });
        console.log('📤 Posted tweet with media');
      } else {
        await bot.sendMessage(telegramChannel, message, { 
          parse_mode: 'Markdown' 
        });
        console.log('📤 Posted text-only tweet');
      }
    });

    stream.on('error', (error) => console.error('❌ Stream error:', error));
  } catch (error) {
    console.error('❌ Failed to start stream:', error);
  }
}

// Start the bot
streamTweets();
