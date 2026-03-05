require('dotenv').config();
const { createClient } = require('./src/client');
const { loadCommands } = require('./src/handler');
const { deployCommands } = require('./src/deploy');

const TOKEN     = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('❌ DISCORD_TOKEN 또는 CLIENT_ID 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

(async () => {
  await deployCommands();
  const client = createClient();
  loadCommands(client);
  client.login(TOKEN);
})();
