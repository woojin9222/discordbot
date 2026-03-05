const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('채널을 잠급니다. (모든 멤버 채팅 불가)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((opt) =>
      opt.setName('channel').setDescription('잠글 채널 (기본: 현재 채널)').setRequired(false),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('잠금 사유').setRequired(false),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const reason  = interaction.options.getString('reason') ?? '사유 없음';

    try {
      // @everyone 역할의 SendMessages 권한을 false로
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🔒 채널 잠금')
            .setDescription(`${channel} 채널이 잠겼습니다.\n모든 멤버가 채팅할 수 없습니다.`)
            .addFields({ name: '사유', value: reason })
            .setColor(0xed4245)
            .setTimestamp(),
        ],
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ 오류')
            .setDescription('채널 잠금에 실패했습니다.\n봇에게 **채널 관리** 권한이 있는지 확인해주세요.')
            .setColor(0xed4245),
        ],
        flags: ['Ephemeral'],
      });
    }
  },
};
