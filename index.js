const { TwitterApi } = require('twitter-api-v2');
const TelegramBot = require('node-telegram-bot-api');

// Config
const telegramToken = process.env.TELEGRAM_TOKEN;
const telegramChannel = process.env.TELEGRAM_CHANNEL;
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const bot = new TelegramBot(telegramToken);

// NEW: Proper streaming implementation
async function streamTweets() {
  try {
    // Create a new client with v1.1 API
    const clientV1 = twitterClient.v1;
    
    // Get user ID first
    const me = await clientV1.verifyCredentials();
    const userId = me.id_str;

    // Create filtered stream
    const stream = await clientV1.filterStream({
      follow: [userId] // Only your tweets
    });

    console.log('✅ Bot started. Listening for tweets...');

    stream.on('data', async (tweet) => {
      // Skip replies/retweets
      if (tweet.in_reply_to_user_id || tweet.retweeted_status) {
        console.log('⏩ Skipped reply/retweet');
        return;
      }

      // Build message
      const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
      let message = `🐦 New Tweet!\n━━━━━━━━━━\n${tweet.text}\n\n🔗 ${tweetUrl}`;

      // Attach media
      if (tweet.extended_entities?.media) {
        const mediaUrl = tweet.extended_entities.media[0].media_url_https;
        await bot.sendPhoto(telegramChannel, mediaUrl, { caption: message });
      } else {
        await bot.sendMessage(telegramChannel, message);
      }
    });

    stream.on('error', (error) => console.error('❌ Stream error:', error));

  } catch (error) {
    console.error('❌ Failed to start stream:', error);
    process.exit(1); // Exit with error code
  }
}

streamTweets();
