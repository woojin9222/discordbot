const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('채널 잠금을 해제합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((opt) =>
      opt.setName('channel').setDescription('잠금 해제할 채널 (기본: 현재 채널)').setRequired(false),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null, // null = 권한 초기화 (서버 기본값으로 복구)
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🔓 채널 잠금 해제')
            .setDescription(`${channel} 채널 잠금이 해제됐습니다.\n멤버들이 다시 채팅할 수 있습니다.`)
            .setColor(0x57f287)
            .setTimestamp(),
        ],
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ 오류')
            .setDescription('채널 잠금 해제에 실패했습니다.\n봇에게 **채널 관리** 권한이 있는지 확인해주세요.')
            .setColor(0xed4245),
        ],
        flags: ['Ephemeral'],
      });
    }
  },
};
