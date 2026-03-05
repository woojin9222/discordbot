const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('로그 채널을 설정합니다. (관리자 전용)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('set')
        .setDescription('로그 채널 설정')
        .addChannelOption((opt) =>
          opt
            .setName('channel')
            .setDescription('로그를 보낼 채널')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName('off').setDescription('로그 기능 끄기'),
    )
    .addSubcommand((sub) =>
      sub.setName('status').setDescription('현재 로그 설정 확인'),
    ),

  async execute(interaction) {
    const sub     = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // 서버별 로그 채널 저장 (메모리, 재시작 시 초기화)
    // 영구 저장이 필요하면 DB 연동 필요
    if (!interaction.client.logChannels) interaction.client.logChannels = new Map();

    if (sub === 'set') {
      const channel = interaction.options.getChannel('channel');
      interaction.client.logChannels.set(guildId, channel.id);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('✅ 로그 채널 설정 완료')
            .setDescription(`${channel} 채널에 로그가 기록됩니다.`)
            .addFields(
              { name: '기록 항목', value: '입장 · 퇴장 · 메시지 삭제 · 메시지 수정 · 밴 · 킥' },
            )
            .setColor(0x57f287),
        ],
        flags: ['Ephemeral'],
      });

    } else if (sub === 'off') {
      interaction.client.logChannels.delete(guildId);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🔕 로그 기능 비활성화')
            .setDescription('로그 기록을 중단했습니다.')
            .setColor(0xfee75c),
        ],
        flags: ['Ephemeral'],
      });

    } else if (sub === 'status') {
      const channelId = interaction.client.logChannels?.get(guildId);
      const channel   = channelId ? interaction.guild.channels.cache.get(channelId) : null;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('⚙️ 로그 설정 현황')
            .setDescription(channel ? `현재 로그 채널: ${channel}` : '로그 채널이 설정되지 않았습니다.')
            .setColor(0x5865f2),
        ],
        flags: ['Ephemeral'],
      });
    }
  },
};
