const { TwitterApi } = require('twitter-api-v2');
const TelegramBot = require('node-telegram-bot-api');

// Config
const telegramToken = process.env.TELEGRAM_TOKEN || 'YOUR_BOT_TOKEN';
const telegramChannel = process.env.TELEGRAM_CHANNEL || '@YourChannel';
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || 'your_api_key',
  appSecret: process.env.TWITTER_API_SECRET || 'your_api_secret',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || 'your_access_token',
  accessSecret: process.env.TWITTER_ACCESS_SECRET || 'your_access_secret',
});

const bot = new TelegramBot(telegramToken);

// Proper streaming implementation
async function streamTweets() {
  try {
    // Create a v1.1 client
    const clientV1 = twitterClient.v1;
    
    // Get your user ID
    const { id_str: userId } = await clientV1.verifyCredentials();
    console.log(`🔍 Monitoring tweets for user ID: ${userId}`);

    // Create filtered stream
    const rules = await clientV1.streamRules();
    if (rules.length === 0) {
      await clientV1.updateStreamRules({
        add: [{ value: `from:${userId}`, tag: 'my-tweets' }]
      });
    }

    const stream = await clientV1.searchStream();
    console.log('✅ Bot started. Listening for tweets...');

    stream.on('data', async (tweet) => {
      // Skip non-tweet objects and retweets
      if (!tweet.text || tweet.retweeted_status) return;

      console.log('🐦 New tweet detected');
      const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
      
      let message = `🐦 New Tweet!\n━━━━━━━━━━\n${tweet.text}\n\n🔗 ${tweetUrl}`;

      // Attach media if available
      if (tweet.extended_entities?.media) {
        const mediaUrl = tweet.extended_entities.media[0].media_url_https;
        await bot.sendPhoto(telegramChannel, mediaUrl, { caption: message });
      } else {
        await bot.sendMessage(telegramChannel, message);
      }
    });

    stream.on('error', error => console.error('❌ Stream error:', error));

  } catch (error) {
    console.error('❌ Failed to start stream:', error);
    process.exit(1);
  }
}

streamTweets();
