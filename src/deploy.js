const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function deployCommands() {
  const commands = [];
  const commandsPath = path.join(__dirname, '..', 'commands');

  for (const category of fs.readdirSync(commandsPath)) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    for (const file of fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'))) {
      const command = require(path.join(categoryPath, file));
      if (command.data && command.execute) {
        commands.push(command.data.toJSON());
      }
    }
  }

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);

  try {
    console.log(`🔄 ${commands.length}개의 슬래시 커맨드를 Discord에 등록 중...`);

    const guildId = process.env.GUILD_ID;

    if (guildId) {
      // 특정 서버에만 등록 (즉시 반영, 개발용)
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: commands },
      );
      console.log(`✅ 길드(${guildId})에 슬래시 커맨드 등록 완료`);
    } else {
      // 전체 글로벌 등록 (반영까지 최대 1시간, 프로덕션용)
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
      );
      console.log('✅ 글로벌 슬래시 커맨드 등록 완료');
    }
  } catch (err) {
    console.error('❌ 슬래시 커맨드 등록 실패:', err);
    process.exit(1);
  }
}

module.exports = { deployCommands };
