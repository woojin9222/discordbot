const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { createDistube } = require('../music/distube');
const { setupLogger } = require('./logger');

function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,       // 멤버 입퇴장 로그
      GatewayIntentBits.GuildMessages,      // 메시지 삭제/수정 로그
      GatewayIntentBits.GuildModeration,    // 밴/킥 로그
      GatewayIntentBits.MessageContent,     // 메시지 내용 캐시
    ],
    partials: [Partials.Message, Partials.Channel], // 캐시 없는 메시지도 처리
  });

  client.once('clientReady', () => {
    client.distube = createDistube(client);
    setupLogger(client);
    console.log(`✅ 봇 준비 완료: ${client.user.tag}`);
    client.user.setActivity('/help | 음악 & 관리', { type: 2 });
  });

  return client;
}

module.exports = { createClient };
