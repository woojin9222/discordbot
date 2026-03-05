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

  // 중복 이름 감지 및 로그
  const names = commands.map((c) => c.name);
  const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
  if (duplicates.length > 0) {
    console.error('❌ 중복된 커맨드 이름 발견:', duplicates);
    process.exit(1);
  }

  console.log(`🔄 ${commands.length}개의 슬래시 커맨드를 등록 중...`);
  console.log('📋 커맨드 목록:', names.join(', '));

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);

  try {
    const guildId = process.env.GUILD_ID;

    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: commands },
      );
      console.log(`✅ 길드(${guildId})에 슬래시 커맨드 등록 완료`);
    } else {
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
