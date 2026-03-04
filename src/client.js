const { Client, GatewayIntentBits } = require('discord.js');
const { createDistube } = require('../music/distube');

function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  // DisTube를 client에 붙여서 모든 명령어에서 interaction.client.distube로 접근
  client.once('clientReady', () => {
    client.distube = createDistube(client);
    console.log(`✅ 봇 준비 완료: ${client.user.tag}`);
    client.user.setActivity('/help | 음악 & 관리', { type: 2 });
  });

  return client;
}

module.exports = { createClient };