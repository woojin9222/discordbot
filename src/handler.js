const fs = require('fs');
const path = require('path');
const { errorEmbed } = require('./utils/embed');
const { handleVerifyButton } = require('./interactions/verifyButton');

function loadCommands(client) {
  const commands = new Map();
  const commandsPath = path.join(__dirname, '..', 'commands');

  for (const category of fs.readdirSync(commandsPath)) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    for (const file of fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'))) {
      const command = require(path.join(categoryPath, file));
      if (!command.data || !command.execute) {
        console.warn(`⚠️  명령어 형식 오류: commands/${category}/${file}`);
        continue;
      }
      commands.set(command.data.name, command);
      console.log(`📦 명령어 로드: ${category}/${command.data.name}`);
    }
  }

  console.log(`\n✅ 총 ${commands.size}개 명령어 로드 완료\n`);

  client.on('interactionCreate', async (interaction) => {

    // ── 슬래시 커맨드 ────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`❌ 명령어 오류 [${interaction.commandName}]:`, err);
        const payload = { embeds: [errorEmbed('명령어 실행 중 오류가 발생했습니다.')], flags: ['Ephemeral'] };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload).catch(() => {});
        } else {
          await interaction.reply(payload).catch(() => {});
        }
      }
      return;
    }

    // ── 버튼 인터랙션 ────────────────────────────────────────
    if (interaction.isButton()) {
      try {
        // customId prefix로 라우팅 (verify_button:ROLE:CHANNEL 형식 지원)
        if (interaction.customId.startsWith('verify_button')) {
          await handleVerifyButton(interaction);
          return;
        }

        // 추후 버튼 추가 시 여기에 case 추가
        // if (interaction.customId.startsWith('other_button')) { ... }

      } catch (err) {
        console.error(`❌ 버튼 오류 [${interaction.customId}]:`, err);
        const payload = { embeds: [errorEmbed('버튼 처리 중 오류가 발생했습니다.')], flags: ['Ephemeral'] };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload).catch(() => {});
        } else {
          await interaction.reply(payload).catch(() => {});
        }
      }
    }
  });
}

module.exports = { loadCommands };
