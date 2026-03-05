const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('멤버를 서버에서 밴합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) =>
      opt.setName('target').setDescription('밴할 멤버').setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('사유').setRequired(false),
    )
    .addIntegerOption((opt) =>
      opt.setName('delete_days').setDescription('메시지 삭제 기간 (기본: 1일)').setRequired(false)
        .addChoices(
          { name: '삭제 안 함', value: 0 },
          { name: '1일',        value: 1 },
          { name: '3일',        value: 3 },
          { name: '7일',        value: 7 },
        ),
    ),

  async execute(interaction) {
    const target     = interaction.options.getMember('target');
    const reason     = interaction.options.getString('reason') ?? '사유 없음';
    const deleteDays = interaction.options.getInteger('delete_days') ?? 1;

    if (!target)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 찾을 수 없습니다.')], flags: ['Ephemeral'] });
    if (!target.bannable)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 밴할 수 없습니다.\n봇 역할이 대상보다 높은지 확인해주세요.')], flags: ['Ephemeral'] });
    if (target.id === interaction.user.id)
      return interaction.reply({ embeds: [errorEmbed('자기 자신을 밴할 수 없습니다.')], flags: ['Ephemeral'] });

    await target.ban({ reason, deleteMessageSeconds: deleteDays * 86400 });

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔨 멤버 밴')
          .addFields(
            { name: '대상',             value: `${target.user.tag} (${target.user.id})`, inline: true },
            { name: '메시지 삭제',      value: deleteDays ? `${deleteDays}일치` : '없음', inline: true },
            { name: '사유',             value: reason, inline: false },
          )
          .setColor(0xed4245)
          .setTimestamp(),
      ],
    });
  },
};
