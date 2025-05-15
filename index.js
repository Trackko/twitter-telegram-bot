const { TwitterApi } = require('twitter-api-v2');
const TelegramBot = require('node-telegram-bot-api');

// Configuration with YOUR keys
const twitterClient = new TwitterApi({
  appKey: 'c1vhMTmK8GuLcOFJ79aduK5et',
  appSecret: 'hes96oAF3ABxrbRUf9awcJ8gSCMXqtXTDPuaBnS102oIQbEvAH',
  accessToken: '1785931378107748353-iRS5DDsXrGzchDhl90JtqQNuKtcXDg',
  accessSecret: '0T93ThzVcvMJ3IRddeBk0mtgtOHXnJCcIkNfWh4l9JrAs'
});

const bot = new TelegramBot('7704093377:AAFpAgbQ6_dbHQm_WZcDxd8EAFJx78-y-Fg', { polling: false });
const telegramChannel = '@Cryptoland007';

// Enhanced error handling and logging
async function initializeBot() {
  try {
    console.log('🔍 Verifying Twitter credentials...');
    const user = await twitterClient.v2.me();
    console.log(`✅ Connected to Twitter as @${user.data.username}`);

    console.log('🔄 Starting tweet stream...');
    const stream = await twitterClient.v1.filterStream({
      expansions: ['attachments.media_keys'],
      'media.fields': ['url']
    });

    console.log('🤖 Bot is now monitoring tweets for @Cryptoland007');
    
    stream.on('data', async tweet => {
      try {
        // Skip retweets and replies
        if (tweet.retweeted_status || tweet.in_reply_to_user_id) return;

        const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
        let message = `🐦 New Tweet from @${tweet.user.screen_name}:\n━━━━━━━━━━━━━━\n${tweet.text}\n\n🔗 ${tweetUrl}`;

        // Handle media attachments
        if (tweet.extended_entities?.media) {
          const mediaUrls = tweet.extended_entities.media.map(m => m.media_url_https);
          await bot.sendPhoto(telegramChannel, mediaUrls[0], { caption: message });
          console.log('📸 Sent tweet with media');
        } else {
          await bot.sendMessage(telegramChannel, message);
          console.log('✉️ Sent text tweet');
        }
      } catch (error) {
        console.error('⚠️ Error processing tweet:', error);
      }
    });

    stream.on('error', error => {
      console.error('🔴 Stream error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

initializeBot();
