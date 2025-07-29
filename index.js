require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command('/at-everyone', async ({ command, ack, say, client }) => {
  await ack();

  const userMention = `<@${command.user_id}>`;
  const message = command.text || 'No message provided';

  try {
    // JOIN THE DAMN CHANNEL
    await client.conversations.join({
      channel: command.channel_id
    });
  } catch (e) {
    if (e.data?.error === 'already_in_channel') {
      // we vibin'
    } else if (e.data?.error === 'method_not_supported_for_channel_type') {
      console.log('Can’t join private channel, invite the bot manually.');
    } else {
      console.error('Error joining channel:', e.data?.error || e.message);
    }
  }

  try {
    // SEND THAT PING WITH MAX RESPECT
    await say({
      channel: command.channel_id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<!channel>, ${userMention}: ${message}`
          }
        }
      ],
      text: `<!channel> ${userMention}: ${message}` // fallback text for legacy clients
    });
  } catch (e) {
    console.error('Error sending message:', e.data?.error || e.message);
  }
});

(async () => {
  await app.start(process.env.PORT || 4221);
  console.log('at-everyone is ready to rule the world!');
})();
