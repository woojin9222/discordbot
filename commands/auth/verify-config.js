const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-config')
    .setDescription('현재 인증 설정을 확인합니다. (관리자 전용)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const roleId = process.env.VERIFIED_ROLE_ID;
    const channelId = process.env.VERIFIED_CHANNEL_ID;

    const role = roleId ? interaction.guild.roles.cache.get(roleId) : null;
    const channel = channelId ? interaction.guild.channels.cache.get(channelId) : null;

    const configEmbed = new EmbedBuilder()
      .setTitle('⚙️ 인증 설정 현황')
      .setColor(0x5865f2)
      .addFields(
        {
          name: '🎭 인증 역할 (VERIFIED_ROLE_ID)',
          value: role ? `${role} (\`${role.id}\`)` : '❌ 미설정 — `.env`에 `VERIFIED_ROLE_ID`를 추가하세요.',
        },
        {
          name: '📢 인증 후 접근 채널 (VERIFIED_CHANNEL_ID)',
          value: channel
            ? `${channel} (\`${channel.id}\`)`
            : '⚠️ 미설정 — 역할 부여만 진행됩니다.',
        },
      )
      .addFields({
        name: '📖 설정 방법',
        value:
          '1. `.env` 파일에 아래 값을 추가하세요.\n```\nVERIFIED_ROLE_ID=역할_ID\nVERIFIED_CHANNEL_ID=채널_ID\n```\n2. 봇을 재시작하면 적용됩니다.\n3. `/verify-setup` 으로 인증 패널을 생성하세요.',
      })
      .setFooter({ text: '역할/채널 ID는 개발자 모드에서 우클릭 > ID 복사로 확인할 수 있습니다.' });

    await interaction.reply({ embeds: [configEmbed], ephemeral: true });
  },
};
