const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

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
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') ?? '사유 없음';

    if (!target)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 찾을 수 없습니다.')], ephemeral: true });
    if (!target.bannable)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 밴할 수 없습니다.')], ephemeral: true });

    await target.ban({ reason, deleteMessageSeconds: 60 * 60 * 24 });
    await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}**를 밴했습니다.\n사유: ${reason}`)] });
  },
};
